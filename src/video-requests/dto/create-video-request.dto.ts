import { IsString, IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import {
  VideoResolution,
  VideoAspectRatio,
} from '../schemas/video-request.schema';

export class CreateVideoRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(VideoResolution)
  resolution: VideoResolution;

  @IsEnum(VideoAspectRatio)
  aspectRatio: VideoAspectRatio;

  @IsNumber()
  @Min(1)
  durationSeconds: number;
}
