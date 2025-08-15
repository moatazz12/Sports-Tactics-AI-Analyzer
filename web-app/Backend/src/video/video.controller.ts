/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface UploadedFileType {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  private readonly logger = new Logger(VideoController.name);
  
  constructor(private readonly videoService: VideoService) {}

  @Get('getAllVideos')
  async getAllVideos() {
    const videos = await this.videoService.getAllVideos();
    if (!videos || videos.length === 0) {
      return { status: 'success', message: 'No videos found', data: [] };
    }
    return { status: 'success', data: videos };
  }

  @Get('getVideoById/:id')
  async getVideoById(@Param('id') id: string) {
    const video = await this.videoService.getVideoById(id);
    return { status: 'success', data: video };
  }

  @Post('createVideo')
  async createVideo(@Body() createVideoDto: CreateVideoDto) {
    const video = await this.videoService.createVideo(createVideoDto);
    return { status: 'success', data: video };
  }

  @Post('uploadVideo')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(@UploadedFile() file: UploadedFileType) {
    this.logger.log('Upload request received');
    this.logger.log('File:', file ? {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    } : 'No file');
    
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }
    
    try {
      const video = await this.videoService.uploadVideo(file);
      this.logger.log('Video uploaded successfully:', video.id);
      return { status: 'success', data: video };
    } catch (error) {
      this.logger.error('Video upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Post('bulkUpload')
  @UseInterceptors(FilesInterceptor('files'))
  async bulkUpload(@UploadedFiles() files: UploadedFileType[], @Body() body: { annotations?: string }) {
    this.logger.log('Bulk upload request received');
    this.logger.log('Files count:', files?.length || 0);
    
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Check file limit (5 files maximum)
    const MAX_FILES = 5;
    if (files.length > MAX_FILES) {
      throw new BadRequestException(`Too many files. Maximum allowed is ${MAX_FILES} files, received ${files.length}.`);
    }

    // Parse annotations from the request body
    let annotations: any[] = [];
    if (body.annotations) {
      try {
        annotations = JSON.parse(body.annotations) as any[];
      } catch (error) {
        this.logger.error('Failed to parse annotations:', error);
        throw new BadRequestException('Invalid annotations format');
      }
    }

    try {
      const result = await this.videoService.bulkUpload(files, annotations);
      this.logger.log('Bulk upload completed successfully');
      return { status: 'success', data: result };
    } catch (error) {
      this.logger.error('Bulk upload failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  @Put('updateVideo/:id')
  async updateVideo(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    const video = await this.videoService.updateVideo(id, updateVideoDto);
    return { status: 'success', data: video };
  }

  @Delete('deleteVideo/:id')
  async deleteVideo(@Param('id') id: string) {
    await this.videoService.deleteVideo(id);
    return { status: 'success', data: 'Video deleted successfully' };
  }
}
