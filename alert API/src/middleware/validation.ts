import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';


export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req.body);
      
      req.body = result;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation error',
          details: errorMessages
        });
      }
      
      // Handle other errors
      return res.status(500).json({
        error: 'Server error during validation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}; 