import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const eventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().valid('conference', 'workshop', 'seminar', 'concert', 'sports', 'exhibition', 'networking', 'other').required(),
  location: Joi.string().required(),
  venue: Joi.string().required(),
  date: Joi.date().greater('now').required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  price: Joi.number().min(0).required(),
  totalSeats: Joi.number().min(1).required(),
  imageUrl: Joi.string().uri().optional()
});

export const bookingSchema = Joi.object({
  event: Joi.string().required(),
  seatsBooked: Joi.number().min(1).max(10).required()
});

export const validateRegister = validateRequest(registerSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateEvent = validateRequest(eventSchema);
export const validateBooking = validateRequest(bookingSchema);
