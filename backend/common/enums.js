const VideoRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

const VideoResolution = {
  SD: 'SD',
  HD: 'HD',
  FHD: 'FHD',
  _4K: '4K',
};

const VideoAspectRatio = {
  _16_9: '16:9',
  _4_3: '4:3',
  _1_1: '1:1',
  _9_16: '9:16',
};

module.exports = {
  VideoRequestStatus,
  VideoResolution,
  VideoAspectRatio,
};
