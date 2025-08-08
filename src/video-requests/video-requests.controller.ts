import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideoRequestsService } from './video-requests.service';
import { CreateVideoRequestDto } from './dto/create-video-request.dto';
import { UpdateVideoRequestDto } from './dto/update-video-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('video-requests')
@Controller('video-requests')
@UseGuards(JwtAuthGuard)
export class VideoRequestsController {
  constructor(private readonly videoRequestsService: VideoRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new video request' })
  create(@Body() createVideoRequestDto: CreateVideoRequestDto) {
    return this.videoRequestsService.create(createVideoRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all video requests' })
  findAll() {
    return this.videoRequestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single video request' })
  findOne(@Param('id') id: string) {
    return this.videoRequestsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update status or video info' })
  update(
    @Param('id') id: string,
    @Body() updateVideoRequestDto: UpdateVideoRequestDto,
  ) {
    return this.videoRequestsService.update(id, updateVideoRequestDto);
  }

  @Post(':id/modification')
  @ApiOperation({
    summary:
      'Create a new video request using the given one as parentRequestId with a modified prompt',
  })
  createModification(
    @Param('id') id: string,
    @Body() createVideoRequestDto: CreateVideoRequestDto,
  ) {
    return this.videoRequestsService.createModification(
      id,
      createVideoRequestDto,
    );
  }
}
