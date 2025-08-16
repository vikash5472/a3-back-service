const express = require('express');
const router = express.Router();
const { createValidator } = require('express-joi-validation');
const validator = createValidator();

const {
  registerUserSchema,
  loginUserSchema,
} = require('../../utils/validators');

const {
  registerUser,
  loginUser,
} = require('./authController');

router.post('/register', validator.body(registerUserSchema), registerUser);
router.post('/login', validator.body(loginUserSchema), loginUser);

module.exports = router;
