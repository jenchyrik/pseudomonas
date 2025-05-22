import { IsDate, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { MucoidPhenotype, ExoStatus, FlagellarAntigen } from '../entities/point.entity';

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

  @IsEnum(FlagellarAntigen)
  @IsOptional()
  flagellarAntigen?: FlagellarAntigen;

  @IsEnum(MucoidPhenotype)
  @IsOptional()
  mucoidPhenotype?: MucoidPhenotype;

  @IsEnum(ExoStatus)
  @IsOptional()
  exoS?: ExoStatus;

  @IsEnum(ExoStatus)
  @IsOptional()
  exoU?: ExoStatus;

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

  @IsString()
  @IsOptional()
  createdBy?: string;
} 