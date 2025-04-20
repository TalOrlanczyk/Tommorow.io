import { Request, Response } from "express";
import { Alert } from "../../../models/Alert";

interface CreateAlertBody {
    name?: string;
    description?: string;
    parameter: string;
    location:string;
    threshold: {
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    };
    userId: string;
  }
  

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      Alert.find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Alert.countDocuments({ userId })
    ]);

    res.json({
      data: alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts", error });
  }
};

export const createAlert = async (req: Request<{}, {}, CreateAlertBody>, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { name, description, location, parameter, threshold } = req.body;
    
    // Check if location is in lat,long format and format it to 4 decimal places
    let formattedLocation = location;
    const decimalDegreeRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (decimalDegreeRegex.test(location)) {
      const [lat, lon] = location.split(',').map(Number);
      formattedLocation = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
    
    const alertName = name ?? `${parameter} ${threshold.operator} ${threshold.value} Alert`;
    const alert = new Alert({ 
      name: alertName, 
      description, 
      location: formattedLocation, 
      parameter, 
      threshold,
      userId 
    });
    
    await alert.save();

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error creating alert", error });
  }
};
