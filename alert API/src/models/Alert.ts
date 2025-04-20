import mongoose, { Document, Schema } from 'mongoose';

// Interface for the Alert document
export interface IAlert extends Document {
  name?: string;
  description?: string;
  location: string;
  parameter: string;
  threshold: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
  status: 'triggered' | 'notTriggered';
  userId: string;
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
  userId: {
    type: String,
    required: true
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

// Index for location-based queries
AlertSchema.index({ location: 1 });
// Create and export the model
export const Alert = mongoose.model<IAlert>('Alert', AlertSchema); 
// const changeStream = Alert.watch([
//   {
//     $match: {
//       operationType: 'update',
//       'updateDescription.updatedFields.status': { $exists: true }
//     }
//   }
// ]);
// changeStream.on('change', (change) => {
//   console.log('Change detected:', change);
// });