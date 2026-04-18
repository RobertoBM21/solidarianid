import { Injectable } from '@nestjs/common';
import { DonationIntentionDto } from '../../initiatives/application/dtos/donation-intention.dto';
import { InitiativesIntegrationService } from '../../initiatives/infrastructure/initiatives-integration.service';
import { RequestDonationIntentionPort } from '../application/ports/request-donation-intention.port';

@Injectable()
export class DonationIntentionIntegrationAdapter
  implements RequestDonationIntentionPort
{
  constructor(private readonly integrationApi: InitiativesIntegrationService) {}

  requestDonation(data: DonationIntentionDto) {
    return this.integrationApi.requestDonation(data);
  }
}
