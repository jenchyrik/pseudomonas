import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePointDto } from './create-point.dto';

export class ImportPointsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePointDto)
  points: CreatePointDto[];
} 