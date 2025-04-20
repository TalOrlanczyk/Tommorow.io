import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/database';
import apiRouter from './api';
import { SocketService } from './services/socket.service';
import { AlertWatcherService } from './services/alert-watcher.service';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3001;

// Initialize services
async function initializeServices() {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Initialize Socket.IO
    SocketService.getInstance(httpServer);

    // Initialize Alert Watcher
    AlertWatcherService.getInstance();

    // Middleware
    app.use(express.json());
    app.use(cors());

    // Routes
    app.use('/api', apiRouter);

    // Start the server
    httpServer.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start the application
initializeServices(); 