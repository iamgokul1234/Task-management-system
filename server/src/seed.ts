import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Task } from './models/Task';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Database cleared.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
    });

    // 2. Create Employees
    const employees = await User.create([
      { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'employee', isActive: true },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'employee', isActive: true },
      { name: 'Bob Wilson', email: 'bob@example.com', password: 'password123', role: 'employee', isActive: true },
      { name: 'Alice Jones', email: 'alice@example.com', password: 'password123', role: 'employee', isActive: false },
      { name: 'Mike Brown', email: 'mike@example.com', password: 'password123', role: 'employee', isActive: true },
    ]);

    // 3. Create Tasks
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 5);
    const pastDate = new Date();
    pastDate.setDate(now.getDate() - 2);

    await Task.insertMany([
      // Active Task
      {
        title: 'Design new landing page',
        description: 'Create Figma mockups for the new landing page.',
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
        priority: 'high',
        status: 'active',
        startDate: now,
        dueDate: futureDate,
      },
      // Pending Task
      {
        title: 'Update API documentation',
        description: 'Review and update Swagger docs.',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
        priority: 'medium',
        status: 'pending',
        startDate: now,
        dueDate: futureDate,
      },
      // Completed Task
      {
        title: 'Fix login bug',
        description: 'Resolve issue #44 on GitHub.',
        assignedTo: employees[0]._id,
        assignedBy: admin._id,
        priority: 'high',
        status: 'completed',
        startDate: pastDate,
        dueDate: now,
        completedAt: now,
      },
      // Late Active Task (dueDate in past, not completed)
      {
        title: 'Submit quarterly report',
        description: 'Compile Q3 financials.',
        assignedTo: employees[2]._id,
        assignedBy: admin._id,
        priority: 'low',
        status: 'active',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        dueDate: pastDate,
      },
      // Late Completed Task (completedAt > dueDate)
      {
        title: 'Onboard new client',
        description: 'Setup workspace for XYZ Corp.',
        assignedTo: employees[1]._id,
        assignedBy: admin._id,
        priority: 'medium',
        status: 'completed',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        completedAt: new Date(now.getFullYear(), now.getMonth(), 6), // 1 day late
      },
    ]);

    console.log('Database Seeding Completed Successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
