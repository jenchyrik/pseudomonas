import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum MucoidPhenotype {
  MUTANT = 'mutant',
  WILD_TYPE = 'wild type'
}

export enum ExoStatus {
  POSITIVE = '+',
  NEGATIVE = '-'
}

export enum FlagellarAntigen {
  A1 = 'A1',
  A2 = 'A2',
  B = 'B',
  UNDEFINED = 'не определен'
}

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

  @Column({
    type: 'enum',
    enum: FlagellarAntigen,
    default: FlagellarAntigen.UNDEFINED
  })
  flagellarAntigen: FlagellarAntigen;

  @Column({
    type: 'enum',
    enum: MucoidPhenotype,
    default: MucoidPhenotype.WILD_TYPE
  })
  mucoidPhenotype: MucoidPhenotype;

  @Column({
    type: 'enum',
    enum: ExoStatus,
    default: ExoStatus.NEGATIVE
  })
  exoS: ExoStatus;

  @Column({
    type: 'enum',
    enum: ExoStatus,
    default: ExoStatus.NEGATIVE
  })
  exoU: ExoStatus;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  isolationObject: string;
} 