import { CronJob } from "cron";
import connectDB from "./config/database";
import { Alert } from "./models/Alert";
import {
  aggregateAlerts,
  getAlertsToTrigger,
} from "./services/alertEvaluationService";
import { sleep } from "./utils/utils";
// Connect to MongoDB
connectDB(process.env.MONGODB_URI as string).catch(console.error);

// Function to be executed by the cron job
export const taskToExecute = async () => {
  try {
    const now = new Date();
    console.log(`Cron job executed at: ${now.toISOString()}`);
    const locationMap = await aggregateAlerts();
    if (!locationMap) {
      console.error("No location map found");
      return;
    }
    const alertsIdsToUpdate = await getAlertsToTrigger(locationMap);
    await Alert.updateMany(
      { _id: { $in: alertsIdsToUpdate } },
      { $set: { status: "triggered" } }
    );
    await sleep(120000); // wait 2 minutes (mimic the time it takes to trigger the alert and finish send all alerts)
    await Alert.updateMany(
      { _id: { $in: alertsIdsToUpdate } },
      { $set: { status: "notTriggered" } }
    );
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Create a cron job that runs every 5 minutes
const job = new CronJob("*/5 * * * *", taskToExecute, null, true, "UTC");
