import {
  UserHistoryItem as DomainUserHistoryItem,
  UserCollaborationHistory,
} from '@app/shared/application/dtos/my-collaborations.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import {
  REPORTS_SERVICE_NAME,
  ReportsServiceClient,
  UserCollaborationHistory as UserCollaborationHistoryGrpc,
  UserHistoryItem,
  UserHistoryItemType,
} from '@app/shared/infrastructure/grpc/stubs/reports';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices/interfaces/client-grpc.interface';
import { firstValueFrom } from 'rxjs';
import { UserHistoryPort } from '../../application/ports/user-history.port';

@Injectable()
export class UserHistoryGrpcAdapter implements UserHistoryPort, OnModuleInit {
  private readonly logger = new Logger(UserHistoryGrpcAdapter.name);

  private coreService!: ReportsServiceClient;

  constructor(
    @Inject(GrpcPackages.Reports.Client)
    private readonly coreGrpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.coreService =
      this.coreGrpcClient.getService<ReportsServiceClient>(
        REPORTS_SERVICE_NAME,
      );
  }

  async getUserHistory(userId: string): Promise<UserCollaborationHistory> {
    this.logger.debug(
      `Fetching user history for userId ${userId} from gRPC service...`,
    );
    const grpcResponse: UserCollaborationHistoryGrpc = await firstValueFrom(
      this.coreService.getUserContributions({ id: userId }),
    );

    return {
      items: grpcResponse.items
        .map((item: UserHistoryItem) => this.mapGrpcHistoryItem(item))
        .filter((item): item is DomainUserHistoryItem => item !== null),
    };
  }

  private mapGrpcHistoryItem(
    item: UserHistoryItem,
  ): DomainUserHistoryItem | null {
    const mappedType = this.mapUserHistoryItemType(item.type);
    if (!mappedType) {
      this.logger.error(
        `Received user history item with unsupported type: ${String(item.type)}`,
      );
      return null;
    }

    const mappedItem: DomainUserHistoryItem = {
      type: mappedType,
      subject: item.subject,
      date: item.date,
    };

    if (item.causeId !== undefined) {
      mappedItem.causeId = item.causeId;
    }

    return mappedItem;
  }

  private mapUserHistoryItemType(
    type: UserHistoryItemType,
  ): DomainUserHistoryItem['type'] | null {
    switch (type) {
      case UserHistoryItemType.USER_HISTORY_ITEM_TYPE_MEMBERSHIP:
        return 'membership';
      case UserHistoryItemType.USER_HISTORY_ITEM_TYPE_SUPPORT:
        return 'support';
      case UserHistoryItemType.USER_HISTORY_ITEM_TYPE_DONATION:
        return 'donation';
      case UserHistoryItemType.USER_HISTORY_ITEM_TYPE_VOLUNTEERING:
        return 'volunteering';
      default:
        return null;
    }
  }
}
