import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock mongoose connection
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(undefined),
        connection: {
            close: jest.fn().mockResolvedValue(undefined),
            dropDatabase: jest.fn().mockResolvedValue(undefined),
            collections: {},
            on: jest.fn(),
            once: jest.fn()
        },
        Schema: actualMongoose.Schema,
        model: jest.fn().mockImplementation((name, schema) => {
            const Model = class {
                static find = jest.fn().mockResolvedValue([]);
                static findOne = jest.fn().mockResolvedValue(null);
                static findById = jest.fn().mockResolvedValue(null);
                static create = jest.fn().mockImplementation((doc) => Promise.resolve(doc));
                static updateMany = jest.fn().mockResolvedValue({ nModified: 0 });
                static deleteMany = jest.fn().mockResolvedValue({ deletedCount: 0 });
                static aggregate = jest.fn().mockResolvedValue([]);
                static bulkWrite = jest.fn().mockResolvedValue({ nModified: 0 });

                _id: string;
                save: jest.Mock;

                constructor(data: any) {
                    Object.assign(this, data);
                    this._id = data._id || new mongoose.Types.ObjectId().toString();
                    this.save = jest.fn().mockResolvedValue(this);
                }
            };

            // Add static methods
            Object.assign(Model, {
                find: jest.fn().mockResolvedValue([]),
                findOne: jest.fn().mockResolvedValue(null),
                findById: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockImplementation((doc) => Promise.resolve(doc)),
                updateMany: jest.fn().mockResolvedValue({ nModified: 0 }),
                deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
                aggregate: jest.fn().mockResolvedValue([]),
                bulkWrite: jest.fn().mockResolvedValue({ nModified: 0 })
            });

            return Model;
        })
    };
});

// Mock the database connection
beforeAll(async () => {
    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValue(undefined);
    (mongoose.connection.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'connected') {
            callback();
        }
    });
});

// Clean up after tests
afterAll(async () => {
    // Mock database cleanup
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// Reset mocks before each test
beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset all mongoose model mocks
    Object.keys(mongoose.connection.collections).forEach(key => {
        const collection = mongoose.connection.collections[key];
        if (collection.deleteMany) {
            (collection.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
        }
    });
});

// Helper function to mock database responses
export const mockMongoose = {
    mockFind: (model: any, data: any[]) => {
        model.find.mockResolvedValue(data);
    },
    mockFindOne: (model: any, data: any) => {
        model.findOne.mockResolvedValue(data);
    },
    mockCreate: (model: any, data: any) => {
        model.create.mockResolvedValue(data);
    },
    mockUpdateMany: (model: any, result: { nModified: number }) => {
        model.updateMany.mockResolvedValue(result);
    },
    mockAggregate: (model: any, data: any[]) => {
        model.aggregate.mockResolvedValue(data);
    },
    mockBulkWrite: (model: any, result: { nModified: number }) => {
        model.bulkWrite.mockResolvedValue(result);
    }
}; 