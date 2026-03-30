import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { QueryPeriodDto } from './dto/query-period.dto';
import { EconomiaService } from './economia.service';

const PERIOD_ERROR_MESSAGE = 'Período inválido. Use: 1M, 6M, 1Y, 5Y, 10Y';

@Controller('api/economia')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: () => new BadRequestException(PERIOD_ERROR_MESSAGE),
  }),
)
export class EconomiaController {
  constructor(private readonly economiaService: EconomiaService) {}

  @Get('summary')
  getSummary() {
    return this.economiaService.getSummary();
  }

  @Get('selic')
  getSelic(@Query() dto: QueryPeriodDto) {
    return this.economiaService.getSeries('selic', dto.period ?? '1Y');
  }

  @Get('ipca')
  getIpca(@Query() dto: QueryPeriodDto) {
    return this.economiaService.getSeries('ipca', dto.period ?? '1Y');
  }

  @Get('dolar')
  getDolar(@Query() dto: QueryPeriodDto) {
    return this.economiaService.getSeries('dolar', dto.period ?? '1Y');
  }

  @Get('cdi')
  getCdi(@Query() dto: QueryPeriodDto) {
    return this.economiaService.getSeries('cdi', dto.period ?? '1Y');
  }

  @Get('desemprego')
  getDesemprego(@Query() dto: QueryPeriodDto) {
    return this.economiaService.getSeries('desemprego', dto.period ?? '1Y');
  }

  @Get('pib-estados')
  getPibEstados() {
    return this.economiaService.getPibEstados();
  }

  @Get('pib-setores')
  getPibSetores() {
    return this.economiaService.getPibSetores();
  }

  @Get('mapa')
  getMapa() {
    return this.economiaService.getMapa();
  }
}
