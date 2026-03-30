import { IsIn, IsOptional } from 'class-validator';

export type PeriodFilter = '1M' | '6M' | '1Y' | '5Y' | '10Y';

export class QueryPeriodDto {
  @IsOptional()
  @IsIn(['1M', '6M', '1Y', '5Y', '10Y'])
  period?: PeriodFilter = '1Y';
}
