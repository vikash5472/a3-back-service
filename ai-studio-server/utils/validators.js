const Joi = require('joi');

// User Schemas
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  loginType: Joi.string().valid('email', 'google').default('email'),
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  loginType: Joi.string().valid('email', 'google').optional(),
}).min(1); // At least one field must be present for update

const userIdSchema = Joi.object({
  id: Joi.string().required(), // Assuming ID is a string (e.g., MongoDB ObjectId)
});

// Auth Schemas
const registerUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  loginType: Joi.string().valid('email', 'google').default('email'),
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  currentPassword: Joi.string().required(), // Current password is required for any profile modification
}).min(2); // At least currentPassword and one other field must be present

// Credits Schemas
const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  cursor: Joi.string().optional(),
});

const createIntentSchema = Joi.object({
  planId: Joi.string().hex().length(24).required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  paginationSchema,
  createIntentSchema,
};
