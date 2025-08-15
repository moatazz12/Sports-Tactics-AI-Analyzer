/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { AnnotationService } from '../annotation/annotation.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private annotationService: AnnotationService
  ) {}

  async getAllVideos() {
    return await this.prisma.video.findMany();
  }

  async getVideoById(id: string) {
    return await this.prisma.video.findUnique({
      where: { id },
    });
  }

  async createVideo(createVideoDto: CreateVideoDto) {
    return await this.prisma.video.create({
      data: createVideoDto,
    });
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    return await this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  async deleteVideo(id: string) {
    return await this.prisma.video.delete({
      where: { id },
    });
  }

  private async validateVideoDuration(filePath: string): Promise<void> {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`);
      const duration = parseFloat(stdout.trim());
      
      if (isNaN(duration) || duration <= 0) {
        throw new BadRequestException('Invalid video file or unable to determine duration');
      }
      
      if (duration > 300) { // 5 minutes limit
        throw new BadRequestException('Video duration exceeds 5 minutes limit');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to validate video file');
    }
  }

  async uploadVideo(file: { mimetype: string; size: number; originalname: string; buffer: Buffer }) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only video files are allowed.');
    }

    // Check for duplicate filename
    const existingVideo = await this.prisma.video.findFirst({
      where: {
        filename: file.originalname
      }
    });

    if (existingVideo) {
      throw new BadRequestException(`A video with the filename '${file.originalname}' already exists. Please use a different filename or delete the existing video first.`);
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename using only the original name
    const filename = file.originalname;
    const filePath = path.join(uploadsDir, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Validate video duration
    await this.validateVideoDuration(filePath);

    // Save video info to database (only path field exists in schema)
    const videoData = {
      path: filePath,
      filename: file.originalname,
    };

    return await this.createVideo(videoData);
  }

  async bulkUpload(files: { mimetype: string; size: number; originalname: string; buffer: Buffer }[], annotations: any) {
    const results: {
      videos: any[];
      annotations: any[];
      errors: Array<{ file?: string; annotation?: string; error: string }>;
    } = {
      videos: [],
      annotations: [],
      errors: []
    };

    // Separate videos and JSON files
    const videoFiles = files.filter(file => 
      file.mimetype.startsWith('video/') || 
      file.originalname.match(/\.(mp4|avi|mov|wmv|flv)$/i)
    );

    // Process videos first and store them with their filenames
    const uploadedVideos = new Map<string, any>();
    
    for (const videoFile of videoFiles) {
      try {
        const video = await this.uploadVideo(videoFile);
        results.videos.push(video);
        
        // Store video by filename (without extension) for annotation matching
        const videoName = videoFile.originalname.replace(/\.[^/.]+$/, '');
        uploadedVideos.set(videoName, video);
      } catch (error) {
        results.errors.push({
          file: videoFile.originalname,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Process annotations if provided
    if (annotations && Array.isArray(annotations)) {
      for (const annotation of annotations) {
        try {
          // Find the corresponding video for this annotation
          const videoName = annotation.id_sequence;
          const correspondingVideo = uploadedVideos.get(videoName);
          
          if (!correspondingVideo) {
            results.errors.push({
              annotation: annotation.id_sequence || 'unknown',
              error: `No corresponding video found for annotation ${annotation.id_sequence}`
            });
            continue;
          }

          // Add the videoId to the annotation
          const annotationWithVideoId = {
            ...annotation,
            videoId: correspondingVideo.id,
            domicile: annotation.domicile || null,
            visiteuse: annotation.visiteuse || null
          };

          // Create annotation using the annotation service
          const createdAnnotation = await this.annotationService.createAnnotation(annotationWithVideoId);
          results.annotations.push(createdAnnotation);
        } catch (error) {
          results.errors.push({
            annotation: annotation.id_sequence || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return results;
  }
}
