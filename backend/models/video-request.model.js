const mongoose = require('mongoose');
const { VideoRequestStatus, VideoResolution, VideoAspectRatio } = require('../common/enums');

const VideoMetadataSchema = new mongoose.Schema({
  fileSizeMB: { type: Number, required: true },
  frameRate: { type: Number, required: true },
  durationSeconds: { type: Number, required: true },
  resolution: { type: String, required: true, enum: Object.values(VideoResolution) },
  aspectRatio: { type: String, required: true, enum: Object.values(VideoAspectRatio) },
}, { _id: false });

const VideoSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  likedByUser: { type: Boolean, default: false },
  metadata: { type: VideoMetadataSchema, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
}, { _id: false });

const VideoRequestSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  category: { type: String, required: true },
  resolution: { type: String, required: true, enum: Object.values(VideoResolution) },
  aspectRatio: { type: String, required: true, enum: Object.values(VideoAspectRatio) },
  durationSeconds: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: Object.values(VideoRequestStatus),
    default: VideoRequestStatus.PENDING,
    index: true,
  },
  retryCount: { type: Number, default: 0 },
  video: { type: VideoSchema },
  parentRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoRequest',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('VideoRequest', VideoRequestSchema);
