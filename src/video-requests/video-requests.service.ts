import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoRequest } from './schemas/video-request.schema';
import { CreateVideoRequestDto } from './dto/create-video-request.dto';
import { UpdateVideoRequestDto } from './dto/update-video-request.dto';

@Injectable()
export class VideoRequestsService {
  constructor(
    @InjectModel(VideoRequest.name)
    private videoRequestModel: Model<VideoRequest>,
  ) {}

  async create(
    createVideoRequestDto: CreateVideoRequestDto,
  ): Promise<VideoRequest> {
    const createdVideoRequest = new this.videoRequestModel(
      createVideoRequestDto,
    );
    return createdVideoRequest.save();
  }

  async findAll(): Promise<VideoRequest[]> {
    return this.videoRequestModel.find().exec();
  }

  async findOne(id: string): Promise<VideoRequest> {
    const videoRequest = await this.videoRequestModel.findById(id).exec();
    if (!videoRequest) {
      throw new NotFoundException(`Video request with id ${id} not found`);
    }
    return videoRequest;
  }

  async update(
    id: string,
    updateVideoRequestDto: UpdateVideoRequestDto,
  ): Promise<VideoRequest> {
    const updatedVideoRequest = await this.videoRequestModel
      .findByIdAndUpdate(id, updateVideoRequestDto, { new: true })
      .exec();
    if (!updatedVideoRequest) {
      throw new NotFoundException(`Video request with id ${id} not found`);
    }
    return updatedVideoRequest;
  }

  async createModification(
    id: string,
    createVideoRequestDto: CreateVideoRequestDto,
  ): Promise<VideoRequest> {
    const parentRequest = await this.findOne(id);
    const modification = new this.videoRequestModel({
      ...createVideoRequestDto,
      parentRequestId: parentRequest._id,
    });
    return modification.save();
  }
}
