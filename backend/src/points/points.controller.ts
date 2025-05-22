import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ImportPointsDto } from './dto/import-points.dto';

@Controller('points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post()
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  create(@Body() createPointDto: CreatePointDto) {
    return this.pointsService.create(createPointDto);
  }

  @Post('import')
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  import(@Body() importPointsDto: ImportPointsDto) {
    return this.pointsService.import(importPointsDto.points);
  }

  @Get()
  findAll() {
    return this.pointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updatePointDto: UpdatePointDto) {
    return this.pointsService.update(+id, updatePointDto);
  }

  @Delete(':id')
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.pointsService.remove(+id);
  }
} 