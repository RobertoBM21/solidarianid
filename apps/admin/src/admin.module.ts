import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PresentationModule } from './presentation/presentation.module';

@Module({
  imports: [ConfigModule.forRoot(), InfrastructureModule, PresentationModule],
})
export class AdminModule {}
