import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum VideoRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum VideoResolution {
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4K',
}

export enum VideoAspectRatio {
  AR16_9 = '16:9',
  AR1_1 = '1:1',
}

@Schema({ _id: false })
class VideoMetadata {
  @Prop({ required: true })
  fileSizeMB: number;

  @Prop({ required: true })
  frameRate: number;

  @Prop({ required: true })
  durationSeconds: number;

  @Prop({ required: true, enum: Object.values(VideoResolution) })
  resolution: string;

  @Prop({ required: true, enum: Object.values(VideoAspectRatio) })
  aspectRatio: string;
}

@Schema({ _id: false })
class Video {
  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  thumbnailUrl: string;

  @Prop({ default: false })
  likedByUser: boolean;

  @Prop({ type: VideoMetadata, required: true })
  metadata: VideoMetadata;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class VideoRequest extends Document {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: Object.values(VideoResolution) })
  resolution: string;

  @Prop({ required: true, enum: Object.values(VideoAspectRatio) })
  aspectRatio: string;

  @Prop({ required: true })
  durationSeconds: number;

  @Prop({
    required: true,
    enum: Object.values(VideoRequestStatus),
    default: VideoRequestStatus.PENDING,
  })
  status: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop({ type: Video })
  video?: Video;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'VideoRequest',
    default: null,
  })
  parentRequestId: MongooseSchema.Types.ObjectId | null;
}

export const VideoRequestSchema = SchemaFactory.createForClass(VideoRequest);
