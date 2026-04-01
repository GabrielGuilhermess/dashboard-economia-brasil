import { Expose } from 'class-transformer';

export class PibSetorDto {
  @Expose()
  setor!: string;

  @Expose()
  valor!: number;

  @Expose()
  percentual!: number;

  @Expose()
  anoReferencia!: number;
}
