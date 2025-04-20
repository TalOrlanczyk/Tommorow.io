import mongoose from 'mongoose';
import connectDB from '../config/database';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 0,
    on: jest.fn(),
  },
}));

// Mock console
const mockConsoleLog = jest.spyOn(console, 'log');
const mockConsoleError = jest.spyOn(console, 'error');
const mockProcessExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
  throw new Error('process.exit: ' + number);
});

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
    mockProcessExit.mockClear();
  });

  it('should connect to the database successfully', async () => {
    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);
    (mongoose.connection.readyState as number) = 1;

    await connectDB(process.env.MONGODB_URI as string);

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI || 'mongodb://localhost:27017/alerts');
    expect(mockConsoleLog).toHaveBeenCalledWith('Successfully connected to MongoDB.');
  });

  it('should handle connection errors', async () => {
    // Mock connection error
    const error = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    await expect(connectDB(process.env.MONGODB_URI as string)).rejects.toThrow('process.exit: 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Error connecting to MongoDB:', error);
  });

  it('should use default URI when MONGODB_URI is not set', async () => {


    await expect(connectDB('')).rejects.toThrow('process.exit: 1');
    expect(mockConsoleError).toHaveBeenCalledWith('Error connecting to MongoDB:', new Error('MONGODB_URI is not set'));

  });
});


