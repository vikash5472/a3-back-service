const express = require('express');
const router = express.Router();
const { getHealth } = require('./healthController');

router.get('/', getHealth);

module.exports = router;
