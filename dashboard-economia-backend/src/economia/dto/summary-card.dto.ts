import { Expose } from 'class-transformer';

export class SummaryCardDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  value!: string;

  @Expose()
  unit!: string;

  @Expose()
  change!: number;

  @Expose()
  changeLabel!: string;

  @Expose()
  invertSentiment!: boolean;

  @Expose()
  color!: 'emerald' | 'rose' | 'amber' | 'sky';
}
