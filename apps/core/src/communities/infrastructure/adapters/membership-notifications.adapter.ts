import { Injectable } from '@nestjs/common';
import { NotificationsIntegrationService } from '../../../notifications/infrastructure/notifications-integration.service';
import { MembershipNotificationsPort } from '../../application/ports/membership-notifications.port';

@Injectable()
export class MembershipNotificationsAdapter extends MembershipNotificationsPort {
  constructor(
    private readonly notificationsIntegrationService: NotificationsIntegrationService,
  ) {
    super();
  }

  async sendMembershipDecision(
    userId: string,
    communityName: string,
    accepted: boolean,
  ): Promise<void> {
    const title = accepted ? 'Membresía aceptada' : 'Membresía rechazada';
    const verdictLabel = accepted ? 'aceptada' : 'rechazada';
    await this.notificationsIntegrationService.send(userId, {
      title,
      body: `Tu solicitud para "${communityName}" ha sido ${verdictLabel}.`,
      url: '/profile',
    });
  }
}
