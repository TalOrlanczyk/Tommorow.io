import axios from 'axios';
import { Location } from './temperatureMonitor.service'; // Import Location from the new service file
const API_KEY = process.env.TOMORROW_API_KEY;
const API_BASE_URL = `${process.env.TOMORROW_API_URL}/weather`;

// Define expected API response structure
interface TomorrowApiResponse {
    data: {
        time: string;
        values: {
            temperature?: number;
            // Add other fields if needed
        }
    };
    location: {
        lat: number;
        lon: number;
        name?: string;
        type: string;
    };
}

/**
 * Fetches real-time temperature from Tomorrow.io API.
 * @param location - The latitude and longitude coordinates.
 * @returns The API response data.
 * @throws Error if API key is missing or API call fails.
 */
export async function getRealtimeTemperature(location: string): Promise<TomorrowApiResponse> {

    if (!process.env.TOMORROW_API_KEY) {
        throw new Error('TOMORROW_API_KEY environment variable not set.');
    }

    const units = 'metric';

    const url = `${API_BASE_URL}/realtime?location=${location}&units=${units}&apikey=${process.env.TOMORROW_API_KEY}`;

    try {
        const response = await axios.get<TomorrowApiResponse>(url);

        // Basic validation of the response
        if (response.status !== 200 || !response.data?.data?.values) {
            console.error('Invalid response structure from Tomorrow.io API:', response.data);
            throw new Error('Received invalid data structure from Tomorrow.io API.');
        }
        
        return response.data;
    } catch (error) {
        console.error('Error fetching data from Tomorrow.io API:');
        if (axios.isAxiosError(error)) {
            throw error;
        } else {
            throw new Error('An unknown error occurred while fetching weather data.');
        }
    }
} 