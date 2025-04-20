import axios from 'axios';
import { getWeatherData } from '../services/tomorrowIoService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console.error
global.console.error = jest.fn();

describe('Tomorrow.io Weather Service', () => {
  const mockApiKey = 'test_api_key';
  const mockLocations = ['location1', 'location2', 'location3'];
  const mockWeatherData = {
    data: {
      data: {
        values: {
          temperature: 20,
          humidity: 60,
          windSpeed: 10
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOMORROW_API_KEY = mockApiKey;
    process.env.TOMORROW_API_URL = 'https://api.tomorrow.io/v4';
  });

  describe('getWeatherData', () => {
    it('should fetch weather data for multiple locations', async () => {
      // Setup
      mockedAxios.get.mockResolvedValue(mockWeatherData);

      // Execute
      const result = await getWeatherData(mockLocations);

      // Verify
      expect(result.size).toBe(mockLocations.length);
      mockLocations.forEach(location => {
        expect(result.has(location)).toBe(true);
        expect(result.get(location)).toEqual(mockWeatherData.data.data);
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(mockLocations.length);
    });

    it('should handle rate limiting (429 status)', async () => {
      // Setup
      const rateLimitError = {
        response: { status: 429 }
      };
      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValueOnce(rateLimitError);

      // Execute
      const result = await getWeatherData(mockLocations);

      // Verify
      expect(result.size).toBe(1); // Only first location should be processed
      expect(result.has(mockLocations[0])).toBe(true);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded'),
        expect.any(Object)
      );
    });

    it('should handle other API errors gracefully', async () => {
      // Setup
      const apiError = {
        response: { status: 500 }
      };
      mockedAxios.get
        .mockResolvedValueOnce(mockWeatherData)
        .mockRejectedValueOnce(apiError)
        .mockRejectedValueOnce(apiError);

      // Execute
      const result = await getWeatherData(mockLocations);

      // Verify
      expect(result.size).toBe(1); // First location should still be processed
      expect(result.has(mockLocations[0])).toBe(true);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error fetching weather data'),
        expect.any(Object)
      );
    });

    it('should use correct API parameters', async () => {
      // Setup
      const baseUrl = 'https://api.tomorrow.io/v4';
      process.env.TOMORROW_API_URL = baseUrl;
      mockedAxios.get.mockResolvedValue(mockWeatherData);

      // Execute
      await getWeatherData([mockLocations[0]]);

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${baseUrl}/weather/realtime`,
        {
          params: {
            apikey: mockApiKey,
            location: mockLocations[0],
            units: 'metric'
          }
        }
      );
    });

    it('should handle empty locations array', async () => {
      // Execute
      const result = await getWeatherData([]);

      // Verify
      expect(result.size).toBe(0);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should process locations in batches of 5', async () => {
      // Setup
      const manyLocations = Array(12).fill('location');
      mockedAxios.get.mockResolvedValue(mockWeatherData);

      // Execute
      await getWeatherData(manyLocations);

      // Verify
      expect(mockedAxios.get).toHaveBeenCalledTimes(12);
    });

    it('should add delay between batches', async () => {
      // Setup
      const manyLocations = Array(6).fill('location');
      mockedAxios.get.mockResolvedValue(mockWeatherData);
      
      // Mock setTimeout
      const originalSetTimeout = global.setTimeout;
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
      
      try {
        // Execute
        await getWeatherData(manyLocations);

        // Verify
        expect(mockedAxios.get).toHaveBeenCalledTimes(6);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      } finally {
        // Restore original setTimeout
        setTimeoutSpy.mockRestore();
      }
    });
  });
});
