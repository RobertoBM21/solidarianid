import {
  Controller,
  Get,
  InternalServerErrorException,
  Render,
  UseGuards,
} from '@nestjs/common';
import { LoggedInGuard } from '../../../../authentication/infrastructure/presentation/guards/logged-in.guard';
import { StatisticsPort } from '../../../application/ports/statistics.port';

@Controller('dashboard')
@UseGuards(LoggedInGuard)
export class DashboardController {
  constructor(private readonly statisticsPort: StatisticsPort) {}

  @Get()
  @Render('dashboard')
  async dashboard() {
    const statsOrError = await this.statisticsPort.getGlobalStatistics();
    if (statsOrError.isLeft()) {
      throw new InternalServerErrorException(
        `Failed to load dashboard statistics: ${statsOrError.value.message}`,
      );
    }

    const stats = statsOrError.value;
    const statsJson = JSON.stringify(stats);
    const totals = {
      donations: stats.totals.donations.toFixed(0),
      supports: stats.totals.supports.toFixed(0),
      causes: stats.totals.causes.toFixed(0),
      communities: stats.totals.communities.toFixed(0),
    };

    return {
      title: 'Estadísticas',
      stats,
      statsJson,
      totals,
    };
  }
}
