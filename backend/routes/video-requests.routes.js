const express = require('express');
const router = express.Router();
const passport = require('passport');
const VideoRequestsService = require('../services/video-requests.service');

// All routes in this router are protected by JWT authentication
router.use(passport.authenticate('jwt', { session: false }));

// Create a new video request
router.post('/', async (req, res, next) => {
  try {
    const createdVideoRequest = await VideoRequestsService.create(req.body);
    res.status(201).json(createdVideoRequest);
  } catch (error) {
    next(error);
  }
});

// Get all video requests
router.get('/', async (req, res, next) => {
  try {
    const videoRequests = await VideoRequestsService.findAll();
    res.status(200).json(videoRequests);
  } catch (error) {
    next(error);
  }
});

// Get a single video request by ID
router.get('/:id', async (req, res, next) => {
  try {
    const videoRequest = await VideoRequestsService.findOne(req.params.id);
    res.status(200).json(videoRequest);
  } catch (error) {
    next(error);
  }
});

// Update status or video info of a video request by ID
router.put('/:id', async (req, res, next) => {
  try {
    const updatedVideoRequest = await VideoRequestsService.update(req.params.id, req.body);
    res.status(200).json(updatedVideoRequest);
  } catch (error) {
    next(error);
  }
});

// Create a new video request using the given one as parentRequestId with a modified prompt
router.post('/:id/modification', async (req, res, next) => {
  try {
    const modification = await VideoRequestsService.createModification(req.params.id, req.body);
    res.status(201).json(modification);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
