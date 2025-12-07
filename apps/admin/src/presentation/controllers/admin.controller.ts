import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AdminController {
  @Get()
  @Render('index')
  index() {
    return { title: 'Inicio' };
  }
}
