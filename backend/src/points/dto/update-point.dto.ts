import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePointDto {
  @IsString()
  @IsOptional()
  strainName?: string;

  @IsString()
  @IsOptional()
  crisprType?: string;

  @IsString()
  @IsOptional()
  indelGenotype?: string;

  @IsString()
  @IsOptional()
  serogroup?: string;

  @IsString()
  @IsOptional()
  flagellarAntigen?: string;

  @IsString()
  @IsOptional()
  mucoidPhenotype?: string;

  @IsString()
  @IsOptional()
  exoS?: string;

  @IsString()
  @IsOptional()
  exoU?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsDate()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  isolationObject?: string;
} 