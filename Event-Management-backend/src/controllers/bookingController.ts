import { Response } from "express";
import mongoose from "mongoose";
import Booking from "../models/Booking";
import Event from "../models/Event";
import { AuthRequest } from "../types";

export const createBooking = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { event: eventId, seatsBooked } = req.body;
    const userId = req.user?.id;

    // Check if event exists
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is in the future
    if (event.date < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot book tickets for past events",
      });
    }

    // Check if user already has a booking for this event
    const existingBooking = await Booking.findOne({
      user: userId,
      event: eventId,
      status: "confirmed",
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "You already have a booking for this event",
      });
    }

    // Check seat availability
    if (event.availableSeats < seatsBooked) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seats available`,
      });
    }

    // Calculate total amount
    const totalAmount = event.price * seatsBooked;

    // Create booking
    const booking = new Booking({
      user: userId,
      event: eventId,
      seatsBooked,
      totalAmount,
      status: "confirmed",
    });

    await booking.save({ session });

    // Update available seats
    event.availableSeats -= seatsBooked;
    await event.save({ session });

    await session.commitTransaction();

    // Populate booking for response
    await booking.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title date venue location price" },
    ]);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { booking },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { user: userId };
    if (status) query.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("event", "title date venue location price imageUrl")
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const booking = await Booking.findOne({ _id: id, user: userId })
      .populate("event", "title date venue location price imageUrl")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Find the booking
    const booking = await Booking.findOne({ _id: id, user: userId }).session(
      session
    );

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Find the event to restore seats
    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event has already passed (optional business rule)
    const now = new Date();
    const eventDate = new Date(event.date);
    const hoursDifference =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking less than 24 hours before the event",
      });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save({ session });

    // Restore available seats
    event.availableSeats += booking.seatsBooked;
    await event.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: { booking },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    session.endSession();
  }
};

// Add these functions to your bookingController.ts file

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, eventId, userId } = req.query;

    // Build query object
    const query: any = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;
    if (userId) query.user = userId;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("event", "title date venue location price imageUrl")
      .populate("user", "name email")
      .lean();

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching all bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getEventBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Build query object
    const query: any = { event: eventId };
    if (status) query.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("user", "name email")
      .lean();

    const total = await Booking.countDocuments(query);

    // Calculate booking statistics
    const stats = await Booking.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSeats: { $sum: "$seatsBooked" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
          location: event.location,
        },
        bookings,
        stats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event bookings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
