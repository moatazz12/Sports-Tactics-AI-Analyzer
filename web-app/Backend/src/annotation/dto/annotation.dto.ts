/* eslint-disable prettier/prettier */
import {IsNotEmpty,IsString,IsOptional} from "class-validator"

export class AnnotationDto {
  @IsString()
  @IsNotEmpty()
  id_sequence: string;

  @IsString()
  @IsNotEmpty()
  annotation: string;

  @IsString()
  @IsNotEmpty()
  validateur: string;

  @IsString()
  commentaire: string;

  @IsString()
  @IsOptional()
  domicile?: string;

  @IsString()
  @IsOptional()
  visiteuse?: string;

  @IsString()
  @IsNotEmpty()
  videoId: string; // Id ObjectId de la vidéo
}

