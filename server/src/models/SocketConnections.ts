import mongoose, { Document, Schema } from 'mongoose';

// Interface for the SocketConnections document
export interface ISocketConnections extends Document {
  userId?: string;
  socketId?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the SocketConnections schema
const SocketConnectionsSchema = new Schema<ISocketConnections>({
  userId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  socketId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create and export the model
export const SocketConnections = mongoose.model<ISocketConnections>('SocketConnections', SocketConnectionsSchema);