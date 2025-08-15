/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsOptional()
  @IsString()
  filename?: string;
}

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  filename?: string;
} 