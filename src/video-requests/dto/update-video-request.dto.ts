import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateVideoRequestDto } from './create-video-request.dto';
import { VideoRequestStatus } from '../../common/enums';

export class UpdateVideoRequestDto extends PartialType(CreateVideoRequestDto) {
  @ApiProperty({
    description: 'The new status of the video request',
    enum: VideoRequestStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(VideoRequestStatus)
  status?: VideoRequestStatus;
}
