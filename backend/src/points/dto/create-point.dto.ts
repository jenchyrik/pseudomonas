import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @IsString()
  @IsNotEmpty()
  flagellarAntigen: string;

  @IsString()
  @IsNotEmpty()
  mucoidPhenotype: string;

  @IsString()
  @IsNotEmpty()
  exoS: string;

  @IsString()
  @IsNotEmpty()
  exoU: string;

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
} 