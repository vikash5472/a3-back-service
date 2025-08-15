const VideoRequest = require('../models/video-request.model');

class VideoRequestsService {
  async create(createVideoRequestDto) {
    try {
      const createdVideoRequest = new VideoRequest(createVideoRequestDto);
      return await createdVideoRequest.save();
    } catch (error) {
      console.error(`Failed to create video request: ${error.message}`);
      throw new Error('Failed to create video request');
    }
  }

  async findAll() {
    try {
      return await VideoRequest.find().exec();
    } catch (error) {
      console.error(`Failed to get video requests: ${error.message}`);
      throw new Error('Failed to get video requests');
    }
  }

  async findOne(id) {
    let videoRequest;
    try {
      videoRequest = await VideoRequest.findById(id).exec();
    } catch (error) {
      console.error(`Failed to get video request with id ${id}: ${error.message}`);
      throw new Error('Failed to get video request');
    }

    if (!videoRequest) {
      throw new Error(`Video request with id ${id} not found`);
    }

    return videoRequest;
  }

  async update(id, updateVideoRequestDto) {
    try {
      const updatedVideoRequest = await VideoRequest.findByIdAndUpdate(id, updateVideoRequestDto, { new: true }).exec();
      if (!updatedVideoRequest) {
        throw new Error(`Video request with id ${id} not found`);
      }
      return updatedVideoRequest;
    } catch (error) {
      console.error(`Failed to update video request with id ${id}: ${error.message}`);
      throw error; // Re-throw the error for now, will handle custom errors later
    }
  }

  async createModification(id, createVideoRequestDto) {
    try {
      const parentRequest = await this.findOne(id);
      const modification = new VideoRequest({
        ...createVideoRequestDto,
        parentRequestId: parentRequest._id,
      });
      return await modification.save();
    } catch (error) {
      console.error(`Failed to create modification for video request with id ${id}: ${error.message}`);
      throw error; // Re-throw the error for now, will handle custom errors later
    }
  }
}

module.exports = new VideoRequestsService();
