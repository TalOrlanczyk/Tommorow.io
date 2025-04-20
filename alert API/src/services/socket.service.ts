import { io, Socket } from 'socket.io-client';
import { Server as HTTPServer } from 'http';
import { IAlert } from '../models/Alert';

export class SocketService {
  private static instance: SocketService;
  private io: Socket;

  private constructor(server: HTTPServer) {
    this.io =io(process.env.SOCKET_URL,  {
        auth: {
          type: "backend"
        }
      });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Join alert-specific room
    });
  }

  public static getInstance(server?: HTTPServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  // Emit alert status change to all clients watching this alert
  public emitAlertStatusChange(alert: Pick<IAlert, '_id' | 'status' | 'updatedAt' | 'userId'>): void {
    this.io.emit('alertStatusChanged', {
      alertId: alert._id,
      status: alert.status,
      updatedAt: alert.updatedAt,
      userId: alert.userId
    });
  }

  public emitAlertCreated(alert: Pick<IAlert, '_id' | 'status' >): void {
    this.io.emit('alertCreated', {
      alertId: alert._id,
      status: alert.status, 
    });
  }
} 