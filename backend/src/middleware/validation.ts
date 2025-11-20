import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array()[0].msg);
  }
  next();
};

export const jobSubmitValidation = [
  body('modelId').isString().notEmpty().withMessage('Model ID is required'),
  body('inputData').exists().withMessage('Input data is required'),
  body('walletAddress').optional().isString(),
  validate,
];

export const jobIdValidation = [
  param('id').isUUID().withMessage('Invalid job ID format'),
  validate,
];

export const verificationValidation = [
  body('jobId').isUUID().withMessage('Invalid job ID'),
  body('signature').isString().notEmpty().withMessage('Signature is required'),
  body('result').exists().withMessage('Result is required'),
  body('inputHash').isString().notEmpty().withMessage('Input hash is required'),
  body('timestamp').isNumeric().withMessage('Timestamp must be numeric'),
  validate,
];
