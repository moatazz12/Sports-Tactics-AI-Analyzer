/* eslint-disable prettier/prettier */
import { IsOptional, IsString } from "class-validator"

export class UpdateAnnotationDto {
  @IsOptional()
  @IsString()
  annotation?: string;

  @IsOptional()
  @IsString()
  validateur?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsOptional()
  @IsString()
  domicile?: string;

  @IsOptional()
  @IsString()
  visiteuse?: string;

  @IsOptional()
  @IsString()
  videoId?: string;
} 