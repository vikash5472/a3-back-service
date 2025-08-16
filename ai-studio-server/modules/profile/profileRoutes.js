const express = require('express');
const router = express.Router();
const { createValidator } = require('express-joi-validation');
const validator = createValidator();

const { protect } = require('../../middlewares/authMiddleware');
const { getProfile, updateProfile } = require('./profileController');
const { updateProfileSchema } = require('../../utils/validators');

router.route('/')
  .get(protect, getProfile)
  .put(protect, validator.body(updateProfileSchema), updateProfile);

module.exports = router;
