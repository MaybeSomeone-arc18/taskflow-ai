import { body } from 'express-validator';

export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Project title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Project description must not exceed 500 characters'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Project color is required')
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage('Project color must be a valid hex color code (e.g. #FF5733 or #FFF)'),
];

export const updateProjectValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Project description must not exceed 500 characters'),
  body('color')
    .optional()
    .trim()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage('Project color must be a valid hex color code'),
  body('status')
    .optional()
    .isIn(['Active', 'Archived'])
    .withMessage('Project status must be either Active or Archived'),
];
