import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import * as TemperatureMonitorService from './services/temperatureMonitor.service'; // Import the new service
import cors from 'cors';
import connectDB from './config/database';
import { SocketConnections } from './models/SocketConnections';
import { safeSocketHandler } from './utils/utils';    
// Load environment variables from .env file
dotenv.config();


// --- Initial Setup ---
const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Allow all origins for now, restrict in production!
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

// Initialize services that need the io instance
TemperatureMonitorService.initializeTemperatureMonitor(io);

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
connectDB(process.env.MONGODB_URI as string);
// --- Basic Routes ---
app.get('/api/health', (req, res) => {
    res.status(200).send('Service is healthy');
});

// --- Helper Functions ---
// Moved to TemperatureMonitorService

// --- Socket.IO Logic ---
io.on('connection', safeSocketHandler(async (socket) => {
    const { id, type } = socket.handshake.auth;
    if (type === "client" && id) {
        try {
            const existing = await SocketConnections.findOne({ userId:id });
    
            if (existing) {
                // Update socket ID if changed
                if (existing.socketId !== socket.id) {
                    existing.socketId = socket.id;
                    existing.updatedAt = new Date();
                    await existing.save();
                }
            } else {
                // New user
                await SocketConnections.create({
                    userId:id,
                    socketId: socket.id
                });
            }
    
            socket.join(`user:${id}`);
            console.log(`👤 Client userId=${id} connected as socket ${socket.id}`);
          
        } catch (err) {
            console.error("❌ Error handling client connection:", err);
            socket.emit('error', { message: 'Error processing connection' });
        }
    }

    console.log(`Socket connected: ${socket.id}`);
    if (type === "backend") {
        console.log(`🛠️ Server B connected as socket ${socket.id}`);
    
        socket.on("alertStatusChanged", ({ alertId,status,updatedAt,userId }) => {
            console.log(`🔄 Status change for user ${alertId}:`, alertId);
            io.to(`user:${userId}`).emit("alertStatusTriggered", {alertId,status,updatedAt});
        });
    }

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });

    // Handle manual location setting by delegating to the service
    socket.on('setLocation',async (location: string) => {
        await TemperatureMonitorService.handleSetLocation(location, socket);
    });
}));

// --- Server Start ---
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`WebSocket server ready`);
}); 