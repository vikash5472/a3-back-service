import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoRequestsController } from './video-requests.controller';
import { VideoRequestsService } from './video-requests.service';
import {
  VideoRequest,
  VideoRequestSchema,
} from './schemas/video-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoRequest.name, schema: VideoRequestSchema },
    ]),
  ],
  controllers: [VideoRequestsController],
  providers: [VideoRequestsService],
})
export class VideoRequestsModule {}
