import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Passport guards are resolved by the framework via @UseGuards()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class GoogleAuthGuard extends AuthGuard('google') {}
