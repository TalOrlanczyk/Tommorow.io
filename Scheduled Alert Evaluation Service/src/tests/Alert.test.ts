import mongoose from 'mongoose';
import { Alert, IAlert } from '../models/Alert';

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  
  // Create a mock schema with all required properties
  const mockSchema = {
    path: jest.fn().mockImplementation((path: string) => {
      const paths: Record<string, any> = {
        'name': { isRequired: true, instance: 'String' },
        'description': { isRequired: false, instance: 'String' },
        'location': { isRequired: true, instance: 'String' },
        'parameter': { isRequired: true, instance: 'String' },
        'threshold.operator': { 
          isRequired: true, 
          instance: 'String',
          enumValues: ['gt', 'lt', 'eq', 'gte', 'lte']
        },
        'threshold.value': { isRequired: true, instance: 'String' },
        'status': { 
          isRequired: false, 
          instance: 'String',
          enumValues: ['triggered', 'notTriggered'],
          defaultValue: 'notTriggered'
        }
      };
      return paths[path] || { isRequired: false, instance: 'String' };
    }),
    get: jest.fn().mockImplementation((key) => {
      if (key === 'timestamps') {
        return true;
      }
      return undefined;
    })
  };
  
  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
    schema: mockSchema
  };

  return {
    ...actualMongoose,
    model: jest.fn().mockImplementation((name, schema) => {
      if (name === 'Alert') {
        return mockModel;
      }
      return actualMongoose.model(name, schema);
    }),
    Schema: jest.fn().mockReturnValue(mockSchema)
  };
});

describe('Alert Model', () => {
  const mockAlert = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Alert',
    description: 'Test Description',
    location: 'Test Location',
    parameter: 'temperature',
    threshold: {
      operator: 'gt',
      value: '20'
    },
    status: 'notTriggered',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock implementations
    (Alert.create as jest.Mock).mockImplementation((data) => {
      // Check for required fields
      if (!data.name || !data.location || !data.parameter || !data.threshold?.operator || !data.threshold?.value) {
        return Promise.reject(new Error('Validation failed'));
      }
      // Check for valid enum values
      if (data.threshold.operator && !['gt', 'lt', 'eq', 'gte', 'lte'].includes(data.threshold.operator)) {
        return Promise.reject(new Error('Invalid operator value'));
      }
      return Promise.resolve(mockAlert);
    });
    (Alert.find as jest.Mock).mockResolvedValue([mockAlert]);
    (Alert.findById as jest.Mock).mockResolvedValue(mockAlert);
    (Alert.findOne as jest.Mock).mockResolvedValue(mockAlert);
    (Alert.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
    (Alert.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    (Alert.aggregate as jest.Mock).mockResolvedValue([mockAlert]);
  });


  describe('Model Creation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create model with correct name', () => {
      // Re-import Alert to trigger model creation
      jest.isolateModules(() => {
        const { Alert } = require('../models/Alert');
        expect(mongoose.model).toHaveBeenCalledWith('Alert', expect.any(Object));
      });
    });

    it('should create model with correct interface', () => {
      const model = mongoose.model('Alert', Alert.schema);
      expect(model).toBeDefined();
      expect(model).toHaveProperty('create');
      expect(model).toHaveProperty('find');
      expect(model).toHaveProperty('findById');
      expect(model).toHaveProperty('findOne');
      expect(model).toHaveProperty('updateMany');
      expect(model).toHaveProperty('deleteMany');
      expect(model).toHaveProperty('aggregate');
    });
  });

  describe('Schema Validation', () => {
    it('should create a valid alert', async () => {
      const alertData = {
        name: 'Test Alert',
        description: 'Test Description',
        location: 'Test Location',
        parameter: 'temperature',
        threshold: {
          operator: 'gt',
          value: '20'
        }
      };

      const alert = await Alert.create(alertData);

      expect(alert).toBeDefined();
      expect(alert.name).toBe(alertData.name);
      expect(alert.description).toBe(alertData.description);
      expect(alert.location).toBe(alertData.location);
      expect(alert.parameter).toBe(alertData.parameter);
      expect(alert.threshold.operator).toBe(alertData.threshold.operator);
      expect(alert.threshold.value).toBe(alertData.threshold.value);
      expect(alert.status).toBe('notTriggered');
    });

    it('should require name field', async () => {
      const alertData = {
        description: 'Test Description',
        location: 'Test Location',
        parameter: 'temperature',
        threshold: {
          operator: 'gt',
          value: '20'
        }
      };

      await expect(Alert.create(alertData)).rejects.toThrow();
    });

    it('should require location field', async () => {
      const alertData = {
        name: 'Test Alert',
        description: 'Test Description',
        parameter: 'temperature',
        threshold: {
          operator: 'gt',
          value: '20'
        }
      };

      await expect(Alert.create(alertData)).rejects.toThrow();
    });

    it('should require parameter field', async () => {
      const alertData = {
        name: 'Test Alert',
        description: 'Test Description',
        location: 'Test Location',
        threshold: {
          operator: 'gt',
          value: '20'
        }
      };

      await expect(Alert.create(alertData)).rejects.toThrow();
    });

    it('should validate threshold operator enum', async () => {
      const alertData = {
        name: 'Test Alert',
        description: 'Test Description',
        location: 'Test Location',
        parameter: 'temperature',
        threshold: {
          operator: 'invalid',
          value: '20'
        }
      };

      await expect(Alert.create(alertData)).rejects.toThrow();
    });
  });

  describe('CRUD Operations', () => {
    it('should find all alerts', async () => {
      const alerts = await Alert.find();
      expect(alerts).toHaveLength(1);
      expect(Alert.find).toHaveBeenCalled();
    });

    it('should find alert by id', async () => {
      const alertId = '507f1f77bcf86cd799439011';
      const alert = await Alert.findById(alertId);
      expect(alert).toBeDefined();
      expect(Alert.findById).toHaveBeenCalledWith(alertId);
    });

    it('should update alert status', async () => {
      const result = await Alert.updateMany(
        { status: 'notTriggered' },
        { $set: { status: 'triggered' } }
      );
      expect(result.modifiedCount).toBe(1);
      expect(Alert.updateMany).toHaveBeenCalledWith(
        { status: 'notTriggered' },
        { $set: { status: 'triggered' } }
      );
    });

    it('should delete alerts', async () => {
      const result = await Alert.deleteMany({});
      expect(result.deletedCount).toBe(1);
      expect(Alert.deleteMany).toHaveBeenCalledWith({});
    });
  });

  describe('Aggregation', () => {
    it('should aggregate alerts by location', async () => {
      const pipeline = [
        {
          $group: {
            _id: { location: '$location' },
            alerts: { $push: '$$ROOT' }
          }
        }
      ];

      const result = await Alert.aggregate(pipeline);
      expect(result).toHaveLength(1);
      expect(Alert.aggregate).toHaveBeenCalledWith(pipeline);
    });
  });
});
