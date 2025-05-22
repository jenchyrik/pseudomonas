import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from './entities/point.entity';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Point)
    private pointsRepository: Repository<Point>,
  ) {}

  async create(createPointDto: CreatePointDto): Promise<Point> {
    const point = this.pointsRepository.create({
      ...createPointDto,
      createdAt: new Date()
    });
    return await this.pointsRepository.save(point);
  }

  async findAll(): Promise<Point[]> {
    return await this.pointsRepository.find();
  }

  async findOne(id: number): Promise<Point> {
    const point = await this.pointsRepository.findOne({ where: { id } });
    if (!point) {
      throw new NotFoundException(`Point with ID ${id} not found`);
    }
    return point;
  }

  async update(id: number, updatePointDto: UpdatePointDto): Promise<Point> {
    const point = await this.findOne(id);
    Object.assign(point, updatePointDto);
    return await this.pointsRepository.save(point);
  }

  async remove(id: number): Promise<void> {
    const point = await this.findOne(id);
    await this.pointsRepository.remove(point);
  }

  async import(points: CreatePointDto[]) {
    console.log('Received points for import:', points);
    const createdPoints = [];
    for (const point of points) {
      try {
        console.log('Processing point:', point);
        const createdPoint = await this.create(point);
        console.log('Successfully created point:', createdPoint);
        createdPoints.push(createdPoint);
      } catch (error) {
        console.error(`Error importing point: ${JSON.stringify(point)}`, error);
        throw error;
      }
    }
    return {
      message: `Successfully imported ${createdPoints.length} points`,
      importedPoints: createdPoints
    };
  }
}