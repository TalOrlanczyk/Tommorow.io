import { Alert } from "../models/Alert";
import { aggregateAlerts, getAlertsToTrigger } from "../services/alertEvaluationService";
import { getWeatherData } from "../services/tomorrowIoService";
import { Types } from "mongoose";
import { IAlert } from "../models/Alert";

// Mock the Alert model
jest.mock("../models/Alert", () => ({
  Alert: {
    aggregate: jest.fn(),
  },
}));

// Mock the tomorrowIoService
jest.mock("../services/tomorrowIoService", () => ({
  getWeatherData: jest.fn(),
}));

// Helper function to create mock alert
const createMockAlert = (overrides: Partial<IAlert> = {}): IAlert => ({
  _id: new Types.ObjectId(),
  location: "location1",
  parameter: "temperature",
  threshold: { operator: "gt", value: "20" },
  status: "notTriggered",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
} as IAlert);

describe("Alert Evaluation Service", () => {
  describe("aggregateAlerts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should aggregate alerts correctly", async () => {
      // Mock the aggregate result
      const mockAggregateResult = [
        {
          location: "location1",
          alerts: [
            createMockAlert(),
          ],
        },
      ];

      // Setup the mock
      (Alert.aggregate as jest.Mock).mockResolvedValue(mockAggregateResult);

      const result = await aggregateAlerts();

      // Verify the aggregate was called with correct pipeline
      expect(Alert.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: { location: "$location" },
            alerts: { $push: "$$ROOT" },
          },
        },
        {
          $project: {
            _id: 0,
            location: "$_id.location",
            alerts: 1,
          },
        },
      ]);

      // Verify the result
      expect(result).toBeDefined();
      expect(result?.size).toBe(1);
      expect(result?.get("location1")).toHaveLength(1);
      expect(result?.get("location1")?.[0].parameter).toBe("temperature");
    });

    it("should handle empty result from aggregate", async () => {
      // Mock empty aggregate result
      (Alert.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await aggregateAlerts();

      expect(result).toBeUndefined();
    });

    it("should handle aggregate errors", async () => {
      // Mock aggregate error
      (Alert.aggregate as jest.Mock).mockRejectedValue(
        new Error("Aggregate error")
      );

      await expect(aggregateAlerts()).rejects.toThrow("Aggregate error");
    });
  });

  describe("getAlertsToTrigger", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should get alerts to trigger correctly", async () => {
      // Mock location map
      const mockLocationMap = new Map([
        ["location1", [createMockAlert()]],
      ]);

      // Mock weather data
      const mockWeatherData = new Map([
        [
          "location1",
          {
            values: {
              temperature: 25,
            },
          },
        ],
      ]);

      // Setup the mock
      (getWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);

      const result = await getAlertsToTrigger(mockLocationMap);

      // Verify the weather service was called with correct locations
      expect(getWeatherData).toHaveBeenCalledWith(["location1"]);

      // Verify the result
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockLocationMap.get("location1")?.[0]._id);
    });

    it("should handle missing weather data for a location", async () => {
      // Mock location map
      const mockLocationMap = new Map([
        ["location1", [createMockAlert()]],
      ]);

      // Mock weather data with missing location
      const mockWeatherData = new Map();

      // Setup the mock
      (getWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);

      const result = await getAlertsToTrigger(mockLocationMap);

      // Verify the result is empty
      expect(result).toHaveLength(0);
    });

    it("should handle invalid weather parameter", async () => {
      // Mock location map
      const mockLocationMap = new Map([
        ["location1", [createMockAlert({ parameter: "invalidParameter" })]],
      ]);

      // Mock weather data
      const mockWeatherData = new Map([
        [
          "location1",
          {
            values: {
              temperature: 25,
            },
          },
        ],
      ]);

      // Setup the mock
      (getWeatherData as jest.Mock).mockResolvedValue(mockWeatherData);

      const result = await getAlertsToTrigger(mockLocationMap);

      // Verify the result is empty
      expect(result).toHaveLength(0);
    });

    it("should handle weather service errors", async () => {
      // Mock location map
      const mockLocationMap = new Map([
        ["location1", [createMockAlert()]],
      ]);

      // Mock weather service error
      (getWeatherData as jest.Mock).mockRejectedValue(
        new Error("Weather service error")
      );

      await expect(getAlertsToTrigger(mockLocationMap)).rejects.toThrow(
        "Weather service error"
      );
    });
  });
});
