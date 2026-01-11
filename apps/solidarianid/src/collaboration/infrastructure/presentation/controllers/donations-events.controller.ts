import {
  CollaborationStatisticsData,
  GetCollaborationStatisticsQuery,
} from '@app/shared/domain/queries/get-collaboration-statistics.query';
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { DonationRepository } from '../../../domain/repositories/donation.repository';

@Controller()
@ApiExcludeController()
export class DonationsEventsController {
  private readonly logger = new Logger(DonationsEventsController.name);

  constructor(private readonly donationRepository: DonationRepository) {}

  @MessagePattern(GetCollaborationStatisticsQuery.name)
  async getCollaborationStatistics(): Promise<CollaborationStatisticsData> {
    this.logger.debug('Received statistics query');
    const total = await this.donationRepository.getTotalDonationsAmount();
    return {
      totalDonationsMoney: total,
    };
  }
}
