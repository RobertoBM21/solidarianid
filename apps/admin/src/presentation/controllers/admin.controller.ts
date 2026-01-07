import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { LoggedInGuard } from '../../authentication/infrastructure/presentation/guards/logged-in.guard';

@Controller()
@UseGuards(LoggedInGuard)
export class AdminController {
  @Get()
  @Render('index')
  index() {
    return { title: 'Inicio' };
  }
}
