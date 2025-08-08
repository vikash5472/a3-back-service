import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateVideoRequestDto } from './create-video-request.dto';
import { VideoRequestStatus } from '../../common/enums';

export class UpdateVideoRequestDto extends PartialType(CreateVideoRequestDto) {
  @IsOptional()
  @IsEnum(VideoRequestStatus)
  status?: VideoRequestStatus;
}
