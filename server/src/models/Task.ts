import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId | IUser;
  assignedBy: mongoose.Types.ObjectId | IUser;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'completed';
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], required: true, index: true },
    status: { type: String, enum: ['active', 'pending', 'completed'], default: 'active', index: true },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true, index: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
