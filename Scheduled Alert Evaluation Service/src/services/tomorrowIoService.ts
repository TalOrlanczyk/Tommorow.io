import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY;
const BASE_URL = `${process.env.TOMORROW_API_URL}/weather/realtime`;

export const getWeatherData = async (locations: string[]): Promise<Map<string, any>> => {
    const results = new Map<string, any>();

    // Batch API calls in groups of 5 to avoid rate limiting
    const BATCH_SIZE = 5;
    let stopFetching = false;
    for (let i = 0; i < locations.length && !stopFetching; i += BATCH_SIZE) {
        const batch = locations.slice(i, i + BATCH_SIZE);
        const promises = batch.map(loc => fetchSingleLocation(loc));
        
        try {
            const batchResults = await Promise.allSettled(promises);
            for (let index = 0; index < batchResults.length; index++) {
                const data = batchResults[index];
                if (data.status === 'fulfilled') {
                    const weatherData = data.value;
                    const loc = batch[index];
                    if(results.has(loc)) {
                        results.get(loc).push(weatherData.data);
                    } else {
                        results.set(loc, weatherData.data);
                    }
                }
                if(data.status === 'rejected') {
                    const responseStatus = data.reason.response.status;
                    if(responseStatus === 429) {
                        console.error(`Rate limit exceeded for location ${batch[index]}:`, data.reason);
                        stopFetching = true;
                        break;
                    } else {
                        console.error(`Error fetching weather data for location ${batch[index]}:`, data.reason);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching batch of weather data:', error);
        }

        // Add a small delay between batches to respect rate limits
        if (i + BATCH_SIZE < locations.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
};

const fetchSingleLocation = async (location: string) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                apikey: TOMORROW_API_KEY,
                location: `${location}`,
                units: 'metric'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching weather data for location ${location}:`, error);
        throw error;
    }
}; 