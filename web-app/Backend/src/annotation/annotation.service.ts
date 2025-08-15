/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnotationDto } from './dto/annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


@Injectable()
export class AnnotationService {
    constructor(private prisma:PrismaService) {}

    async getAnnotation(){
        return await this.prisma.annotation.findMany();
    }

    async createAnnotation(annotation: AnnotationDto){
        try {
            return await this.prisma.annotation.create({data:annotation,})
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new BadRequestException(`Annotation with id_sequence '${annotation.id_sequence}' already exists`);
                }
            }
            throw new BadRequestException('Failed to create annotation');
        }
    }

    async getAnnotationById(id_sequence: AnnotationDto['id_sequence']){
        return await  this.prisma.annotation.findUnique({
            where: {
                id_sequence:id_sequence,
            },
        })
    }
    

    async deleteAnnotation(id_sequence:AnnotationDto['id_sequence']){
        try {
            return await this.prisma.annotation.delete({
                where:{
                    id_sequence:id_sequence,
                }
            })
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
                }
            }
            throw new BadRequestException('Failed to delete annotation');
        }
    }

    async updateAnnotation(id_sequence:AnnotationDto['id_sequence'], annotation:UpdateAnnotationDto){
        // Filter out undefined values
        const updateData = Object.fromEntries(
            Object.entries(annotation).filter(([, value]) => value !== undefined)
        );
        
        try {
            return await this.prisma.annotation.update({
                where:{
                    id_sequence:id_sequence,
                },
                data: updateData,
            })
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundException(`Annotation with id_sequence '${id_sequence}' not found`);
                }
            }
            throw new BadRequestException('Failed to update annotation');
        }
    }
}
