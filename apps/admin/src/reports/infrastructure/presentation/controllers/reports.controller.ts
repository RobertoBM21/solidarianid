import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { LoggedInGuard } from '../../../../authentication/infrastructure/presentation/guards/logged-in.guard';
import { ReportUsersPageDto } from '../../../application/dtos/report-user.dto';
import { UsersPort } from '../../../application/ports/users.port';

@Controller('informes')
@UseGuards(LoggedInGuard)
export class ReportsController {
  constructor(private readonly usersPort: UsersPort) {}

  @Get()
  @Render('reports')
  reports() {
    return {
      title: 'Informes',
    };
  }

  @Get('users')
  async listUsers(
    @Query('page', ParseIntPipe) page?: number,
    @Query('search') search?: string,
  ): Promise<ReportUsersPageDto> {
    return this.usersPort.listUsers(page, search);
  }

  @Get('users/:id/contributions')
  async userContributions(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersPort.getUserHistory(id);
  }
}
