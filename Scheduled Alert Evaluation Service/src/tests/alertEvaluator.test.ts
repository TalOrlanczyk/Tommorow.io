import { evaluateCondition, getWeatherValue, WeatherValues } from '../utils/alertEvaluator';

type ThresholdOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte';

interface ThresholdCheck {
    operator: ThresholdOperator;
    value: number;
}

describe('Alert Evaluator', () => {
    describe('evaluateCondition', () => {
        it('should evaluate greater than condition correctly', () => {
            const threshold: ThresholdCheck = { operator: 'gt', value: 10 };
            expect(evaluateCondition(15, threshold)).toBe(true);
            expect(evaluateCondition(5, threshold)).toBe(false);
            expect(evaluateCondition(10, threshold)).toBe(false);
        });

        it('should evaluate less than condition correctly', () => {
            const threshold: ThresholdCheck = { operator: 'lt', value: 10 };
            expect(evaluateCondition(5, threshold)).toBe(true);
            expect(evaluateCondition(15, threshold)).toBe(false);
            expect(evaluateCondition(10, threshold)).toBe(false);
        });

        it('should evaluate equal condition correctly', () => {
            const threshold: ThresholdCheck = { operator: 'eq', value: 10 };
            expect(evaluateCondition(10, threshold)).toBe(true);
            expect(evaluateCondition(15, threshold)).toBe(false);
            expect(evaluateCondition(5, threshold)).toBe(false);
        });

        it('should evaluate greater than or equal condition correctly', () => {
            const threshold: ThresholdCheck = { operator: 'gte', value: 10 };
            expect(evaluateCondition(15, threshold)).toBe(true);
            expect(evaluateCondition(10, threshold)).toBe(true);
            expect(evaluateCondition(5, threshold)).toBe(false);
        });

        it('should evaluate less than or equal condition correctly', () => {
            const threshold: ThresholdCheck = { operator: 'lte', value: 10 };
            expect(evaluateCondition(5, threshold)).toBe(true);
            expect(evaluateCondition(10, threshold)).toBe(true);
            expect(evaluateCondition(15, threshold)).toBe(false);
        });

        it('should handle invalid operator gracefully', () => {
            const threshold = { operator: 'invalid' as any, value: 10 };
            expect(evaluateCondition(15, threshold)).toBe(false);
        });
    });

    describe('getWeatherValue', () => {
        const mockWeatherData = {
            values: {
                temperature: 25.5,
                humidity: 65,
                windSpeed: 10.2,
                cloudBase: 1000,
                cloudCeiling: 2000,
                cloudCover: 50,
                dewPoint: 15,
                precipitationProbability: 30,
                pressureSeaLevel: 1013,
                pressureSurfaceLevel: 1013,
                rainIntensity: 0.5,
                sleetIntensity: 0,
                snowIntensity: 0,
                temperatureApparent: 25.5,
                uvHealthConcern: 0,
                uvIndex: 0,
                visibility: 10,
                weatherCode: 0,
                windDirection: 0,
                windGust: 0,
                freezingRainIntensity: 0,
            }
        };

        it('should return temperature value correctly', () => {
            expect(getWeatherValue(mockWeatherData, 'temperature')).toBe(25.5);
        });

        it('should return humidity value correctly', () => {
            expect(getWeatherValue(mockWeatherData, 'humidity')).toBe(65);
        });

        it('should return windSpeed value correctly', () => {
            expect(getWeatherValue(mockWeatherData, 'windSpeed')).toBe(10.2);
        });

        it('should handle case-insensitive parameter names', () => {
            expect(getWeatherValue(mockWeatherData, 'TEMPERATURE')).toBe(25.5);
            expect(getWeatherValue(mockWeatherData, 'Humidity')).toBe(65);
        });

        it('should return null for unsupported parameters', () => {
            expect(getWeatherValue(mockWeatherData, 'unsupported')).toBeNull();
        });

        it('should handle missing weather data gracefully', () => {
            expect(getWeatherValue(null as any, 'temperature')).toBeNull();
            expect(getWeatherValue({} as any, 'temperature')).toBeNull();
            expect(getWeatherValue({ values: {} } as any, 'temperature')).toBeNull();
        });
        it('should handle missing values in weather data gracefully and get to catch the error', () => {
            const weatherData = {
                values: {
                    get temperature() {
                        throw new Error('Simulated property error');
                    }
                } as unknown as WeatherValues
            };
    
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
            const result = getWeatherValue(weatherData, 'temperature');
    
            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error extracting weather value:',
                expect.any(Error)
            );
    
            consoleSpy.mockRestore();
        });
        //TEST send back null if the weather data is not found
        it('should send back null if the weather data is not found', () => {
            const weatherData = {
                values: {} as unknown as WeatherValues }
                expect(getWeatherValue(weatherData, 'temperature')).toBeNull();
                expect(getWeatherValue(weatherData, 'humidity')).toBeNull();
                expect(getWeatherValue(weatherData, 'windSpeed')).toBeNull();
            });
    });
}); 