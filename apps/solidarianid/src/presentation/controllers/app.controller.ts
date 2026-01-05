import { Controller, Get, Header } from '@nestjs/common';
import { ApiExcludeController, ApiOkResponse } from '@nestjs/swagger';

@Controller()
@ApiExcludeController()
export class AppController {
  @Get()
  @ApiOkResponse()
  @Header('Content-Type', 'text/plain')
  index(): string {
    return 'Hello World!';
  }
}
