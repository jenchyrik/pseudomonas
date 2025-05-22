import { IsDate, IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MucoidPhenotype, ExoStatus, FlagellarAntigen } from '../entities/point.entity';

export class CreatePointDto {
  @IsString()
  @IsNotEmpty()
  strainName: string;

  @IsString()
  @IsNotEmpty()
  crisprType: string;

  @IsString()
  @IsNotEmpty()
  indelGenotype: string;

  @IsString()
  @IsNotEmpty()
  serogroup: string;

  @IsEnum(FlagellarAntigen)
  @IsNotEmpty()
  flagellarAntigen: FlagellarAntigen;

  @IsEnum(MucoidPhenotype)
  @IsNotEmpty()
  mucoidPhenotype: MucoidPhenotype;

  @IsEnum(ExoStatus)
  @IsNotEmpty()
  exoS: ExoStatus;

  @IsEnum(ExoStatus)
  @IsNotEmpty()
  exoU: ExoStatus;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @Transform(({ value }) => new Date(value))
  date: Date;

  @IsString()
  @IsNotEmpty()
  isolationObject: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
} 