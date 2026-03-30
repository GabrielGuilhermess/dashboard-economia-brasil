import { Expose } from 'class-transformer';

export class SeriePointDto {
  @Expose()
  date!: string;

  @Expose()
  value!: number;
}
