/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RapportDto } from 'src/rapport/dto/rapport.dto';
import { UpdateRapportDto } from 'src/rapport/dto/update-rapport.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class RapportService {
  constructor(private prisma: PrismaService) {}

  async getRapport() {
    return await this.prisma.rapportAnalyse.findMany();
  }

  async createRapport(rapport: RapportDto) {
    try {
      return await this.prisma.rapportAnalyse.create({
        data: rapport,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(`Rapport with id_sequence '${rapport.id_sequence}' already exists`);
        }
      }
      throw new BadRequestException('Failed to create rapport');
    }
  }

  async getRapportById(id_sequence: RapportDto['id_sequence']) {
    return await this.prisma.rapportAnalyse.findUnique({
      where: {
        id_sequence: id_sequence,
      },
    });
  }

  async updateRapport(id_sequence: RapportDto['id_sequence'], updateRapportDto: UpdateRapportDto) {
    // Filter out undefined values
    const updateData = Object.fromEntries(
      Object.entries(updateRapportDto).filter(([, value]) => value !== undefined)
    );
    
    try {
      return await this.prisma.rapportAnalyse.update({
        where: {
          id_sequence: id_sequence,
        },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
        }
      }
      throw new BadRequestException('Failed to update rapport');
    }
  }

  async deleteRapport(id_sequence: RapportDto['id_sequence']) {
    try {
      return await this.prisma.rapportAnalyse.delete({
        where: {
          id_sequence: id_sequence,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
        }
      }
      throw new BadRequestException('Failed to delete rapport');
    }
  }
}
