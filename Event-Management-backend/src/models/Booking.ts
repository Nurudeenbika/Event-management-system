import mongoose, { Schema, Document, Types } from "mongoose";

// TypeScript interface for the Booking document
export interface IBooking extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  seatsBooked: number;
  totalAmount: number;
  status: "confirmed" | "cancelled" | "pending";
  bookingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    seatsBooked: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [1, "At least 1 seat must be booked"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["confirmed", "cancelled", "pending"],
        message: "Status must be either confirmed, cancelled, or pending",
      },
      default: "pending",
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual populate for user details
bookingSchema.virtual("userDetails", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for event details
bookingSchema.virtual("eventDetails", {
  ref: "Event",
  localField: "event",
  foreignField: "_id",
  justOne: true,
});

// Pre-save middleware
bookingSchema.pre("save", function (next) {
  if (this.isNew) {
    this.bookingDate = new Date();
  }
  next();
});

// Export the model
const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
