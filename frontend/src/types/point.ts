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

export interface Point {
  id: number;
  strainName: string;
  crisprType: string;
  indelGenotype: string;
  serogroup: string;
  flagellarAntigen: FlagellarAntigen;
  mucoidPhenotype: MucoidPhenotype;
  exoS: ExoStatus;
  exoU: ExoStatus;
  latitude: number;
  longitude: number;
  date: Date;
  isolationObject: string;
} 