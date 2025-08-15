/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Patch, Post, NotFoundException, UseGuards } from '@nestjs/common';
import { AnnotationService } from './annotation.service';
import { AnnotationDto } from './dto/annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('annotation')
@UseGuards(JwtAuthGuard)
export class AnnotationController {
  constructor(private readonly annotationService: AnnotationService) {}

  @Get('getAllAnnotation')
  async getAnnotations() {
    const annotations = await this.annotationService.getAnnotation();     
    if (!annotations) {
    return { status: 'success', message: 'No annotation found', data: [] };
  }
    return { status: 'success', data: annotations };
  }

  @Post('createAnnotation')
  async createAnnotation(@Body() annotation: AnnotationDto) {
    const createdAnnotation = await this.annotationService.createAnnotation(annotation);
    return { status: 'success', data: createdAnnotation };
  }

  @Get('getAnnotationById/:id_sequence')
  async getAnnotationById(@Param('id_sequence') id_sequence: string) {
    const annotation = await this.annotationService.getAnnotationById(id_sequence);
    if (!annotation) {
      throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
    }
    return annotation;
  }

  @Delete('deleteAnnotation/:id_sequence')
  async deleteAnnotation(@Param('id_sequence') id_sequence: string) {
    const deleted = await this.annotationService.deleteAnnotation(id_sequence);
    if (!deleted) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: 'deleted' };
  }

  @Patch('updateAnnotation/:id_sequence')
  async updateAnnotation(
    @Param('id_sequence') id_sequence: string,
    @Body() annotation: UpdateAnnotationDto,
  ) {
    const updatedAnnotation = await this.annotationService.updateAnnotation(id_sequence, annotation);
    if (!updatedAnnotation) {
      throw new NotFoundException('Annotation not found');
    }
    return { status: 'success', data: updatedAnnotation };
  }
}
