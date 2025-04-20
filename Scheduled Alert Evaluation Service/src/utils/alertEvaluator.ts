interface ThresholdCheck {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
}
export interface WeatherValues {
    cloudBase: number;
    cloudCeiling: number;
    cloudCover: number;
    dewPoint: number;
    freezingRainIntensity: number;
    humidity: number;
    precipitationProbability: number;
    pressureSeaLevel: number;
    pressureSurfaceLevel: number;
    rainIntensity: number;
    sleetIntensity: number;
    snowIntensity: number;
    temperature: number;
    temperatureApparent: number;
    uvHealthConcern: number;
    uvIndex: number;
    visibility: number;
    weatherCode: number;
    windDirection: number;
    windGust: number;
    windSpeed: number;
  }
export const evaluateCondition = (weatherValue: number, threshold: ThresholdCheck): boolean => {
    switch (threshold.operator) {
        case 'gt':
            return weatherValue > threshold.value;
        case 'lt':
            return weatherValue < threshold.value;
        case 'eq':
            return weatherValue === threshold.value;
        case 'gte':
            return weatherValue >= threshold.value;
        case 'lte':
            return weatherValue <= threshold.value;
        default:
            return false;
    }
};

export const getWeatherValue = (weatherData: {values:WeatherValues}, parameter: string): number | null => {
    if (!weatherData || !weatherData.values) {
        return null;
    }
    try {
        const data = weatherData.values;
        switch (parameter.toLowerCase()) {
            case 'temperature':
                return data.temperature ?? null;
            case 'humidity':
                return data.humidity ?? null;
            case 'windspeed':
                return data.windSpeed ?? null;

            default:
                return null;
        }
    } catch (error) {
        console.error('Error extracting weather value:', error);
        return null;
    }
}; 