import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
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
  @ApiBody({ type: CreateVideoRequestDto })
  @ApiResponse({
    status: 201,
    description: 'The video request has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createVideoRequestDto: CreateVideoRequestDto) {
    return this.videoRequestsService.create(createVideoRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all video requests' })
  @ApiResponse({ status: 200, description: 'A list of all video requests.' })
  findAll() {
    return this.videoRequestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single video request' })
  @ApiResponse({ status: 200, description: 'The video request.' })
  @ApiResponse({ status: 404, description: 'Video request not found.' })
  findOne(@Param('id') id: string) {
    return this.videoRequestsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update status or video info' })
  @ApiBody({ type: UpdateVideoRequestDto })
  @ApiResponse({
    status: 200,
    description: 'The video request has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Video request not found.' })
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
  @ApiBody({ type: CreateVideoRequestDto })
  @ApiResponse({
    status: 201,
    description: 'The video request has been successfully created.',
  })
  @ApiResponse({ status: 404, description: 'Parent video request not found.' })
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
