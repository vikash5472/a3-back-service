import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoRequest } from './schemas/video-request.schema';
import { CreateVideoRequestDto } from './dto/create-video-request.dto';
import { UpdateVideoRequestDto } from './dto/update-video-request.dto';

@Injectable()
export class VideoRequestsService {
  private readonly logger = new Logger(VideoRequestsService.name);
  constructor(
    @InjectModel(VideoRequest.name)
    private videoRequestModel: Model<VideoRequest>,
  ) {}

  async create(
    createVideoRequestDto: CreateVideoRequestDto,
  ): Promise<VideoRequest> {
    try {
      const createdVideoRequest = new this.videoRequestModel(
        createVideoRequestDto,
      );
      return await createdVideoRequest.save();
    } catch (error) {
      this.logger.error(
        `Failed to create video request: ${(error as any).message}`,
      );
      throw new InternalServerErrorException('Failed to create video request');
    }
  }

  async findAll(): Promise<VideoRequest[]> {
    try {
      return await this.videoRequestModel.find().exec();
    } catch (error) {
      this.logger.error(
        `Failed to get video requests: ${(error as any).message}`,
      );
      throw new InternalServerErrorException('Failed to get video requests');
    }
  }

  async findOne(id: string): Promise<VideoRequest> {
    let videoRequest;
    try {
      videoRequest = await this.videoRequestModel.findById(id).exec();
    } catch (error) {
      this.logger.error(
        `Failed to get video request with id ${id}: ${(error as any).message}`,
      );
      throw new InternalServerErrorException('Failed to get video request');
    }

    if (!videoRequest) {
      throw new NotFoundException(`Video request with id ${id} not found`);
    }

    return videoRequest as VideoRequest;
  }

  async update(
    id: string,
    updateVideoRequestDto: UpdateVideoRequestDto,
  ): Promise<VideoRequest> {
    try {
      const updatedVideoRequest = await this.videoRequestModel
        .findByIdAndUpdate(id, updateVideoRequestDto, { new: true })
        .exec();
      if (!updatedVideoRequest) {
        throw new NotFoundException(`Video request with id ${id} not found`);
      }
      return updatedVideoRequest;
    } catch (error) {
      this.logger.error(
        `Failed to update video request with id ${id}: ${(error as any).message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update video request');
    }
  }

  async createModification(
    id: string,
    createVideoRequestDto: CreateVideoRequestDto,
  ): Promise<VideoRequest> {
    try {
      const parentRequest = await this.findOne(id);
      const modification = new this.videoRequestModel({
        ...createVideoRequestDto,
        parentRequestId: parentRequest._id,
      });
      return await modification.save();
    } catch (error) {
      this.logger.error(
        `Failed to create modification for video request with id ${id}: ${(error as any).message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create modification');
    }
  }
}
