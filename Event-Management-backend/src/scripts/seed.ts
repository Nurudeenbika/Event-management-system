import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';
import Event from '../models/Event';
import Booking from '../models/Booking';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventbooking.com',
      password: adminPassword,
      role: 'admin'
    });

    // Create regular users
    const userPassword = await bcrypt.hash('user123', 12);
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: userPassword,
        role: 'user'
      }
    ]);

    // Create events
    const events = await Event.create([
      {
        title: 'Tech Conference 2025',
        description: 'Annual technology conference featuring latest trends in AI, ML, and Web Development.',
        category: 'conference',
        location: 'Lagos',
        venue: 'Eko Convention Center',
        date: new Date('2025-07-15'),
        time: '09:00',
        price: 25000,
        totalSeats: 500,
        availableSeats: 500,
        createdBy: admin._id
      },
      {
        title: 'JavaScript Workshop',
        description: 'Hands-on workshop covering modern JavaScript frameworks and best practices.',
        category: 'workshop',
        location: 'Abuja',
        venue: 'TechHub Abuja',
        date: new Date('2025-08-20'),
        time: '10:00',
        price: 15000,
        totalSeats: 50,
        availableSeats: 50,
        createdBy: admin._id
      },
      {
        title: 'React Native Bootcamp',
        description: 'Intensive 3-day bootcamp on React Native mobile app development.',
        category: 'workshop',
        location: 'Lagos',
        venue: 'Co-Creation Hub',
        date: new Date('2025-09-10'),
        time: '09:00',
        price: 50000,
        totalSeats: 30,
        availableSeats: 30,
        createdBy: admin._id
      },
      {
        title: 'Digital Marketing Summit',
        description: 'Learn the latest digital marketing strategies and tools.',
        category: 'seminar',
        location: 'Port Harcourt',
        venue: 'Hotel Presidential',
        date: new Date('2025-08-05'),
        time: '14:00',
        price: 20000,
        totalSeats: 200,
        availableSeats: 200,
        createdBy: admin._id
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Annual startup pitch competition for early-stage companies.',
        category: 'networking',
        location: 'Lagos',
        venue: 'Lagos Business School',
        date: new Date('2025-10-01'),
        time: '16:00',
        price: 5000,
        totalSeats: 300,
        availableSeats: 300,
        createdBy: admin._id
      }
    ]);

    // Create some bookings
    const bookings = await Booking.create([
      {
        user: users[0]._id,
        event: events[0]._id,
        seatsBooked: 2,
        totalAmount: 50000,
        status: 'confirmed'
      },
      {
        user: users[1]._id,
        event: events[1]._id,
        seatsBooked: 1,
        totalAmount: 15000,
        status: 'confirmed'
      },
      {
        user: users[2]._id,
        event: events[2]._id,
        seatsBooked: 1,
        totalAmount: 50000,
        status: 'confirmed'
      }
    ]);

    // Update available seats for booked events
    await Event.findByIdAndUpdate(events[0]._id, { $inc: { availableSeats: -2 } });
    await Event.findByIdAndUpdate(events[1]._id, { $inc: { availableSeats: -1 } });
    await Event.findByIdAndUpdate(events[2]._id, { $inc: { availableSeats: -1 } });

    console.log('Seed data created successfully!');
    console.log(`Admin login: admin@eventbooking.com / admin123`);
    console.log(`User login examples: john@example.com / user123`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
