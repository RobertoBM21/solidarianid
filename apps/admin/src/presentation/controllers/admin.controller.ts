import { Controller, Get, Redirect, UseGuards } from '@nestjs/common';
import { LoggedInGuard } from '../../authentication/infrastructure/presentation/guards/logged-in.guard';

@Controller()
@UseGuards(LoggedInGuard)
export class AdminController {
  @Get()
  @Redirect('/dashboard')
  redirectToDashboard() {
    return;
  }
}
