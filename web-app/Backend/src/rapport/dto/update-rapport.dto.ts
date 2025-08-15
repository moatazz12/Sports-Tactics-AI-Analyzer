import { IsOptional, IsString, IsNumber, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRapportDto {
  @IsOptional()
  @IsString()
  prediction_ia?: string;

  @IsOptional()
  @IsNumber()
  confiance?: number;

  @IsOptional()
  @IsString()
  annotation_humaine?: string;

  @IsOptional()
  @IsString()
  equipe?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  joueurs_detectes?: number[];

  @IsOptional()
  @IsString()
  commentaire_expert?: string;

  @IsOptional()
  @IsString()
  validation?: string;
} 