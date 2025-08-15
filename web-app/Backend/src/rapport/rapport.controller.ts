/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Patch, NotFoundException, UseGuards } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { RapportDto } from './dto/rapport.dto';
import { UpdateRapportDto } from './dto/update-rapport.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rapport')
@UseGuards(JwtAuthGuard)
export class RapportController {
  constructor(private readonly rapportService: RapportService) {}

  @Get('getAllRapport')
  async getRapports() {
    const rapports = await this.rapportService.getRapport();     
    if (!rapports) {
    return { status: 'success', message: 'No rapport found', data: [] };
  }
    return { status: 'success', data: rapports };
  }

  @Post('createRapport')
  async createRapport(@Body() rapport: RapportDto) {
    const createdRapport = await this.rapportService.createRapport(rapport);
    return { status: 'success', data: createdRapport };
  }

  @Get('getRapportById/:id_sequence')
  async getRapportById(@Param('id_sequence') id_sequence: string) {
    const rapport = await this.rapportService.getRapportById(id_sequence);
    if (!rapport) {
      throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
    }
    return rapport;
  }

  @Patch('updateRapport/:id_sequence')
  async updateRapport(
    @Param('id_sequence') id_sequence: string,
    @Body() updateRapportDto: UpdateRapportDto,
  ) {
    const updatedRapport = await this.rapportService.updateRapport(id_sequence, updateRapportDto);
    if (!updatedRapport) {
      throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
    }
    return { status: 'success', data: updatedRapport };
  }

  @Delete('deleteRapport/:id_sequence')
  async deleteRapport(@Param('id_sequence') id_sequence: string) {
    const deleted = await this.rapportService.deleteRapport(id_sequence);
    if (!deleted) {
      throw new NotFoundException(`Rapport with id_sequence '${id_sequence}' not found`);
    }
    return { status: 'success', data: 'deleted' };
  }

}
