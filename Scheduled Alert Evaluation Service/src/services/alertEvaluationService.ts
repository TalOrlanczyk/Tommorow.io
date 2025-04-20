import { Alert, IAlert } from "../models/Alert";
import { getWeatherData } from "./tomorrowIoService";
import { evaluateCondition, getWeatherValue } from "../utils/alertEvaluator";
import { ObjectId } from "mongoose";

export const aggregateAlerts = async (): Promise<Map<string, IAlert[]> | undefined> => {
  try {
    console.log("Starting alert aggregation process");
    // Group alerts by location using aggregation
    const alerts = await Alert.aggregate([
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

    if (alerts.length === 0) {
      console.log("No alerts to process");
      return;
    }

    // Create location map
    const locationMap = new Map<string, IAlert[]>();
    alerts.forEach((alert) => {
      locationMap.set(alert.location, alert.alerts);
    });
    return locationMap;
    // Group alerts by location using aggregation
  } catch (error) {
    console.error("Error in alert aggregation process:", error);
    throw error;
  }
};

export const getAlertsToTrigger = async (locationMap: Map<string, IAlert[]>): Promise<ObjectId[]> => {
  try {
    const weatherData = await getWeatherData(Array.from(locationMap.keys()));
    const alertsIdsToUpdate: ObjectId[] = []
    for(const [location, alerts] of locationMap.entries()) {
      const weather = weatherData.get(location);
      if(!weather) {
          console.error(`No weather data found for location: ${location}`);
          continue;
      }   
      alerts.forEach(alert => {
          const weatherValue = getWeatherValue(weather, alert.parameter);
          if(weatherValue === null) {
              console.error(`Could not get weather value for parameter: ${alert.parameter}`);
              return;
          }
          const threshold = {
              operator: alert.threshold.operator,
              value: Number(alert.threshold.value)
          };
          const isTriggered = evaluateCondition(weatherValue, threshold);
          if(isTriggered) {
              alertsIdsToUpdate.push(alert._id);
          }
          

      });
      
    }
    return alertsIdsToUpdate;
  } catch (error) {
    console.error("Error in alert evaluation process:", error);
    throw error;
  }
};