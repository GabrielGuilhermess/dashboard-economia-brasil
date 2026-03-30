import { Expose } from 'class-transformer';

export class PibEstadoDto {
  @Expose()
  uf!: string;

  @Expose()
  codIbge!: string;

  @Expose()
  nome!: string;

  @Expose()
  valor!: number;

  @Expose()
  participacao!: number;
}
