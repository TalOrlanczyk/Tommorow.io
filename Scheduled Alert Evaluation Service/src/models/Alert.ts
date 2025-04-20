import mongoose, { Document, ObjectId, Schema } from 'mongoose';

// Interface for the Alert document
export interface IAlert extends Document {
  _id: ObjectId;
  name?: string;
  description?: string;
  location:string;
  parameter: string;
  threshold: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
  status: 'triggered' | 'notTriggered';
  createdAt: Date;
  updatedAt: Date;
}

// Create the Alert schema
const AlertSchema = new Schema<IAlert>({
  name: {
    type: String,
    trim: true,
    required: true,

  },
  description: {
    type: String,
    trim: true,
  },
  location: {
      type: String,
      required: true
  },
  parameter: {
    type: String,
    required: true,
    trim: true
  },
  threshold: {
    operator: {
      type: String,
      enum: ['gt', 'lt', 'eq', 'gte', 'lte'],
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['triggered', 'notTriggered'],
    required: false,
    default: 'notTriggered'
  }
}, {
  timestamps: true
});

// Create and export the model
export const Alert = mongoose.model<IAlert>('Alert', AlertSchema); 