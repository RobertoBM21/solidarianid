import { CollaborationStatisticsData } from '../../application/dtos/collaboration-statistics.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { DonationRepository } from '../../domain/repositories/donation.repository';

@Controller()
@ApiExcludeController()
export class DonationsGrpcController {
  private readonly logger = new Logger(DonationsGrpcController.name);

  constructor(private readonly donationRepository: DonationRepository) {}

  @GrpcMethod(GrpcPackages.Statistics.ServiceName)
  async getCollaborationStatistics(): Promise<CollaborationStatisticsData> {
    this.logger.debug('Received statistics query via gRPC');
    const total = await this.donationRepository.getTotalDonationsAmount();
    return {
      totalDonationsMoney: total,
    };
  }
}
