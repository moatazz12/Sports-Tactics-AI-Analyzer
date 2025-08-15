/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnnotationService } from '../annotation/annotation.service';

@Module({
  controllers: [VideoController],
  providers: [VideoService, PrismaService, AnnotationService],
})
export class VideoModule {}
