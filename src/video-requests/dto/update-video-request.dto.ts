import { IsEnum, IsOptional } from 'class-validator';
import { VideoRequestStatus } from '../schemas/video-request.schema';

export class UpdateVideoRequestDto {
  @IsOptional()
  @IsEnum(VideoRequestStatus)
  status?: VideoRequestStatus;
}
