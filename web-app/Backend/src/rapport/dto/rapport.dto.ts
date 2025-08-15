/* eslint-disable prettier/prettier */
import { Type } from "class-transformer";
import {IsNotEmpty,IsString,IsNumber, IsArray, ArrayNotEmpty, IsInt} from "class-validator"

export class RapportDto {
  @IsString()
  @IsNotEmpty()
  id_sequence: string;

  @IsString()
  @IsNotEmpty()
  prediction_ia: string;

  @IsNumber()
  @IsNotEmpty()
  confiance: number;

  @IsString()
  @IsNotEmpty()
  annotation_humaine: string;

  @IsString()
  @IsNotEmpty()
  equipe: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  joueurs_detectes: number[];

  @IsString()
  @IsNotEmpty()
  commentaire_expert: string;

  @IsString()
  @IsNotEmpty()
  validation: string; // Id ObjectId de la vidéo
}

