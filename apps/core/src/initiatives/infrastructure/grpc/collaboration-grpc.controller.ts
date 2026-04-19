import { UserHistoryItem as DomainUserHistoryItem } from '@app/shared/application/dtos/my-collaborations.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import type { UserId } from '@app/shared/infrastructure/grpc/stubs/reports';
import {
  UserCollaborationHistory as UserCollaborationHistoryGrpc,
  UserHistoryItem as UserHistoryItemGrpc,
  UserHistoryItemType,
} from '@app/shared/infrastructure/grpc/stubs/reports';
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ApiExcludeController } from '@nestjs/swagger';
import { CollaborationHistoryPort } from '../../application/ports/collaboration-history.port';

@Controller()
@ApiExcludeController()
export class CollaborationGrpcController {
  private readonly logger = new Logger(CollaborationGrpcController.name);

  constructor(
    private readonly collaborationHistoryPort: CollaborationHistoryPort,
  ) {}

  @GrpcMethod(GrpcPackages.Reports.ServiceName)
  async getUserContributions(
    request: UserId,
  ): Promise<UserCollaborationHistoryGrpc> {
    this.logger.debug(
      `Received collaborations query for userId: ${request.id}`,
    );
    const history = await this.collaborationHistoryPort.getUserCollaborations(
      request.id,
      'ASC',
    );

    return {
      items: history.items.map((item) => this.mapHistoryItemToGrpc(item)),
    };
  }

  private mapHistoryItemToGrpc(
    item: DomainUserHistoryItem,
  ): UserHistoryItemGrpc {
    const grpcItem: UserHistoryItemGrpc = {
      type: this.mapHistoryTypeToGrpc(item.type),
      subject: item.subject,
      date: item.date,
    };

    if (item.causeId !== undefined) {
      grpcItem.causeId = item.causeId;
    }

    if ('amount' in item && typeof item.amount === 'number') {
      grpcItem.donation = { amount: item.amount };
    }

    if ('end' in item && typeof item.end === 'string') {
      grpcItem.volunteering = {
        end: item.end,
      };
    }

    if (item.type === 'membership') {
      grpcItem.membership = {};
    }

    if (item.type === 'support') {
      grpcItem.support = {};
    }

    return grpcItem;
  }

  private mapHistoryTypeToGrpc(
    type: DomainUserHistoryItem['type'],
  ): UserHistoryItemType {
    switch (type) {
      case 'membership':
        return UserHistoryItemType.USER_HISTORY_ITEM_TYPE_MEMBERSHIP;
      case 'support':
        return UserHistoryItemType.USER_HISTORY_ITEM_TYPE_SUPPORT;
      case 'donation':
        return UserHistoryItemType.USER_HISTORY_ITEM_TYPE_DONATION;
      case 'volunteering':
        return UserHistoryItemType.USER_HISTORY_ITEM_TYPE_VOLUNTEERING;
      default:
        return UserHistoryItemType.USER_HISTORY_ITEM_TYPE_UNSPECIFIED;
    }
  }
}
