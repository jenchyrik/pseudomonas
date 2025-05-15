import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('points')
export class Point {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  strainName: string;

  @Column()
  crisprType: string;

  @Column()
  indelGenotype: string;

  @Column()
  serogroup: string;

  @Column()
  flagellarAntigen: string;

  @Column()
  mucoidPhenotype: string;

  @Column()
  exoS: string;

  @Column()
  exoU: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  isolationObject: string;
} 