import { Controller, Get, Render } from '@nestjs/common';

@Controller('informes')
export class ReportsController {
  @Get()
  @Render('reports')
  reports() {
    return {
      title: 'Informes',
    };
  }
}
