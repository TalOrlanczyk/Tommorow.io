import { ChangeStream } from 'mongodb';
import { Alert } from '../models/Alert';
import { SocketService } from './socket.service';

export class AlertWatcherService {
  private static instance: AlertWatcherService;
  private changeStream: ChangeStream | null = null;

  private constructor() {
    this.initializeChangeStream();
  }

  private async initializeChangeStream() {
    try {
      // Watch for changes on the alerts collection
      this.changeStream = Alert.watch([
        {
          $match: {
            operationType: 'update',
            'updateDescription.updatedFields.status': { $exists: true }
          }
        }
      ], {
        fullDocument: 'updateLookup'
      });
      this.changeStream.on('change', async (change) => {
        if (change.operationType === 'update' || change.operationType === 'replace') {
          const alertDoc = change.fullDocument;
          if (alertDoc) {
            const socketService = SocketService.getInstance();
            socketService.emitAlertStatusChange({
              _id: alertDoc._id.toString(),
              status: alertDoc.status,
              updatedAt: alertDoc.updatedAt,
              userId: alertDoc.userId
            });
          }
        }
      });

      console.log('Alert change stream initialized successfully');
    } catch (error) {
      console.error('Error initializing change stream:', error);
    }
  }

  public static getInstance(): AlertWatcherService {
    if (!AlertWatcherService.instance) {
      AlertWatcherService.instance = new AlertWatcherService();
    }
    return AlertWatcherService.instance;
  }

  public async cleanup() {
    if (this.changeStream) {
      await this.changeStream.close();
      this.changeStream = null;
    }
  }
} 