import { Expose, Type } from 'class-transformer';

export class MapaUfDataDto {
  @Expose()
  uf!: string;

  @Expose()
  codIbge!: string;

  @Expose()
  nome!: string;

  @Expose()
  pibTotal!: number;

  @Expose()
  populacao!: number;

  @Expose()
  pibPerCapita!: number;
}

export class MapaResponseDto {
  @Expose()
  geojson!: GeoJSON.FeatureCollection;

  @Expose()
  @Type(() => MapaUfDataDto)
  estados!: MapaUfDataDto[];
}
