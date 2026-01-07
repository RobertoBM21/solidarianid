import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { LoggedInGuard } from '../../../../authentication/infrastructure/presentation/guards/logged-in.guard';

@Controller('informes')
@UseGuards(LoggedInGuard)
export class ReportsController {
  @Get()
  @Render('reports')
  reports() {
    return {
      title: 'Informes',
    };
  }
}
