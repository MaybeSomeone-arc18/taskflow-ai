import { body } from 'express-validator';

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1 })
    .withMessage('Task title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid Project ID format'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format')
    .custom((val) => {
      if (val) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(val);
        inputDate.setHours(0, 0, 0, 0);
        if (inputDate < today) {
          throw new Error('Due date cannot be before today');
        }
      }
      return true;
    }),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be a number greater than or equal to 0'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be a number greater than or equal to 0'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('assignedTo')
    .optional()
    .custom((val) => {
      if (val !== null && val !== undefined && val !== '') {
        // Must be a valid mongo ID
        if (!/^[0-9a-fA-F]{24}$/.test(val)) {
          throw new Error('Assigned user must be a valid Mongo ID');
        }
      }
      return true;
    }),
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Task title cannot be empty'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format')
    .custom((val) => {
      if (val) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(val);
        inputDate.setHours(0, 0, 0, 0);
        if (inputDate < today) {
          throw new Error('Due date cannot be before today');
        }
      }
      return true;
    }),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated hours must be greater than or equal to 0'),
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be greater than or equal to 0'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('assignedTo')
    .optional()
    .custom((val) => {
      if (val !== null && val !== undefined && val !== '') {
        if (!/^[0-9a-fA-F]{24}$/.test(val)) {
          throw new Error('Assigned user must be a valid Mongo ID');
        }
      }
      return true;
    }),
];
