import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  VideoRequestStatus,
  VideoResolution,
  VideoAspectRatio,
} from '../../common/enums';

@Schema({ _id: false })
class VideoMetadata {
  @Prop({ required: true })
  fileSizeMB: number;

  @Prop({ required: true })
  frameRate: number;

  @Prop({ required: true })
  durationSeconds: number;

  @Prop({ required: true, enum: Object.values(VideoResolution) })
  resolution: VideoResolution;

  @Prop({ required: true, enum: Object.values(VideoAspectRatio) })
  aspectRatio: VideoAspectRatio;
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
  resolution: VideoResolution;

  @Prop({ required: true, enum: Object.values(VideoAspectRatio) })
  aspectRatio: VideoAspectRatio;

  @Prop({ required: true })
  durationSeconds: number;

  @Prop({
    required: true,
    enum: Object.values(VideoRequestStatus),
    default: VideoRequestStatus.PENDING,
    index: true,
  })
  status: VideoRequestStatus;

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
