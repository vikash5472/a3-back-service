import { IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VideoResolution, VideoAspectRatio } from '../../common/enums';

export class CreateVideoRequestDto {
  @ApiProperty({ description: 'The prompt for the video request' })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({ description: 'The category of the video request' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'The desired video resolution' })
  @IsEnum(VideoResolution)
  resolution: VideoResolution;

  @ApiProperty({ description: 'The desired video aspect ratio' })
  @IsEnum(VideoAspectRatio)
  aspectRatio: VideoAspectRatio;

  @ApiProperty({ description: 'The desired duration of the video in seconds' })
  @IsNumber()
  @Min(1)
  durationSeconds: number;

  @ApiProperty({
    description: 'Optional: The ID of the video request this is a modification of',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentRequestId?: string;
}
