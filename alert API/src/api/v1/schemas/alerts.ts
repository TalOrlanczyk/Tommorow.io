import { z } from 'zod';

export const createAlertSchema = z.object({
  name: z.preprocess(
    (val) => typeof val === 'string' && val.trim() === '' ? undefined : val,
    z.string().optional()
  ),
  description: z.string().transform((val) => val.trim() === "" ? undefined : val).optional(),
  location: z.string().refine((val) => {
    // Check for decimal degree format (e.g., "42.3478, -71.0466")
    const decimalDegreeRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (decimalDegreeRegex.test(val)) {
      const [lat, lon] = val.split(',').map(Number);
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }

    // Check for US zip code format (e.g., "10001 US")
    const usZipRegex = /^\d{5}\s+[A-Z]{2}$/;
    if (usZipRegex.test(val)) {
      return true;
    }

    // Check for UK postcode format (e.g., "SW1")
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?$/;
    if (ukPostcodeRegex.test(val)) {
      return true;
    }

    // Allow city names (e.g., "new york")
    // This is a simple check - city names can be more complex
    return val.length > 0 && /^[a-zA-Z\s]+$/.test(val);
  }, {
    message: "Location must be in one of these formats: decimal degrees (e.g., '42.3478, -71.0466'), US zip code (e.g., '10001 US'), UK postcode (e.g., 'SW1'), or city name"
  }),
  parameter: z.string(),
  threshold: z.object({
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
    value: z.string(),
  }),
});