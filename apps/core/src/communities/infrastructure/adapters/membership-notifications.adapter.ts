import { UniqueEntityID } from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { NotificationsIntegrationService } from '../../../notifications/infrastructure/notifications-integration.service';
import { MembershipNotificationsPort } from '../../application/ports/membership-notifications.port';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class MembershipNotificationsAdapter extends MembershipNotificationsPort {
  constructor(
    private readonly communityRepository: CommunityRepository,
    private readonly notificationsIntegrationService: NotificationsIntegrationService,
  ) {
    super();
  }

  async sendMembershipAccepted(
    userId: string,
    communityId: string,
  ): Promise<void> {
    await this.sendMembershipDecisionNotification(
      userId,
      communityId,
      'Membresía aceptada',
      'aceptada',
    );
  }

  async sendMembershipRejected(
    userId: string,
    communityId: string,
  ): Promise<void> {
    await this.sendMembershipDecisionNotification(
      userId,
      communityId,
      'Membresía rechazada',
      'rechazada',
    );
  }

  private async sendMembershipDecisionNotification(
    userId: string,
    communityId: string,
    title: string,
    verdictLabel: string,
  ): Promise<void> {
    const communityName = await this.resolveCommunityName(communityId);
    const body = communityName
      ? `Tu solicitud para "${communityName}" ha sido ${verdictLabel}.`
      : `Tu solicitud de membresía ha sido ${verdictLabel}.`;

    await this.notificationsIntegrationService.send(userId, {
      title,
      body,
      url: '/profile',
    });
  }

  private async resolveCommunityName(
    communityId: string,
  ): Promise<string | undefined> {
    const communityOrError = await this.communityRepository.findById(
      UniqueEntityID.create(communityId),
    );

    if (communityOrError.isLeft()) {
      return undefined;
    }

    return communityOrError.value.name;
  }
}
