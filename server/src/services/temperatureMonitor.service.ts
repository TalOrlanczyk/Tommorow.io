import { Server as SocketIOServer, Socket } from 'socket.io';
import { getRealtimeTemperature } from './tomorrowApi';
import axios from 'axios';
import { SocketConnections } from '../models/SocketConnections';

// --- Type Definition ---
export interface Location {
    lat: number;
    lon: number;
}

// --- Module State ---
let io: SocketIOServer;
let currentMonitoredLocation: Location | null = null;
let currentMonitoredLocations: Map<string, Location> = new Map();
let lastTemperatureData: any = null; // Stores the last successfully fetched data
let fetchIntervalId: NodeJS.Timeout | null = null;
let isReachedRateLimit: boolean = false;
const FETCH_INTERVAL_MS =isReachedRateLimit ? 10 * 60 * 1000 : 5 * 60 * 1000; // 5 minutes

// --- Private Helper Functions ---

/**
 * Fetches temperature for the currentMonitoredLocation and broadcasts it via Socket.IO.
 * Also stores the result in lastTemperatureData.
 */
const fetchAndBroadcastTemperature = async (userId: string) => {
    const currentMonitoredLocation = await  SocketConnections.findOne({ userId: userId }).select('location');
    if (!currentMonitoredLocation?.location) {
        return;
    }
    if (!io) {
        console.error('[TempMonitor] Socket.IO instance not available. Cannot broadcast.');
        return;
    }
    const location = currentMonitoredLocation.location.split(',');
    try {
        const weatherData = await getRealtimeTemperature(currentMonitoredLocation.location);

        lastTemperatureData = {
            values: weatherData.data.values,
            locationName: weatherData.location.name || `${currentMonitoredLocation.location}`,
            time: weatherData.data.time,
            coords: { lat: location[0], lon:location[1] }
        };

        io.to(`user:${userId}`).emit('temperatureUpdate', lastTemperatureData);

    } catch (error: any) {
        if(axios.isAxiosError(error)){
            const responseStatus = error.response?.status;
            if(responseStatus === 429){
                isReachedRateLimit = true;
                console.log('[TempMonitor] Rate limit reached, waiting 10 minutes before fetching again.');
            }
        } else {

            console.error('[TempMonitor] Error fetching or broadcasting temperature:', error.message);
        }
       
        io.to(`user:${userId}`).emit('temperatureError', { 
            location: currentMonitoredLocation,
            message: error.message || 'Failed to fetch temperature data.'
        });
        lastTemperatureData = null; // Invalidate data on error
    }
};

/**
 * Starts or restarts the periodic temperature fetching interval.
 */
const userIntervals: Record<string, NodeJS.Timeout> = {};
const startFetchingInterval = (userId: string) => {
    // Clear any existing interval for this user
    if (userIntervals[userId]) {
        clearInterval(userIntervals[userId]);
    }

    

    // Fetch immediately first time
    fetchAndBroadcastTemperature(userId);
    
    // Store the interval ID for this user
    userIntervals[userId] = setInterval(() => fetchAndBroadcastTemperature(userId), FETCH_INTERVAL_MS);
};

// --- Public Service Functions ---

/**
 * Initializes the Temperature Monitor service with the Socket.IO server instance.
 * @param socketIoInstance - The Socket.IO server instance.
 */
export function initializeTemperatureMonitor(socketIoInstance: SocketIOServer) {
    io = socketIoInstance;
    // Optionally, you could load a default/last known location from a database here
}

/**
 * Handles a request to set or update the location being monitored.
 * @param locationData - The new location data { lat, lon }.
 * @param socket - The socket that initiated the request (optional, for sending ACKs/errors).
 */
export async function handleSetLocation(locationData: string, socket?: Socket) {
    const userId = socket?.handshake.auth.id;
    if (locationData && typeof locationData === 'string' && checkLocationFormat(locationData)) {
        await SocketConnections.findOneAndUpdate({ userId: userId }, { location: locationData });

        lastTemperatureData = null; // Reset last known data
        startFetchingInterval(userId); // Restart the fetching process
        // Acknowledge the client if socket is provided
        io?.to(`user:${userId}`).emit('locationSetAck', { success: true, location: locationData });
    } else {
        console.warn('[TempMonitor] Invalid location data received:', locationData);
        // Send error back to the specific client if socket is provided
        io?.to(`user:${userId}`).emit('locationSetAck', { success: false, message: 'Invalid location data format' });
    }
}

/**
 * Returns the last known temperature data.
 * @returns The last temperature data object or null.
 */
export function getLastTemperatureData(): any {
    return lastTemperatureData;
} 

const checkLocationFormat = (locationData: string) => {
    const decimalDegreeRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (decimalDegreeRegex.test(locationData)) {
      const [lat, lon] = locationData.split(',').map(Number);
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    // Check for US zip code format (e.g., "10001 US")
    const usZipRegex = /^\d{5}\s+[A-Z]{2}$/;
    if (usZipRegex.test(locationData)) {
      return true;
    }

    // Check for UK postcode format (e.g., "SW1")
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?$/;
    if (ukPostcodeRegex.test(locationData)) {
      return true;
    }

    // Allow city names (e.g., "new york")
    // This is a simple check - city names can be more complex
    return locationData.length > 0 && /^[a-zA-Z\s]+$/.test(locationData);
}
