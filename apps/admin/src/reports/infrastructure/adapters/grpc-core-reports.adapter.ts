import {
  UserHistoryItem as DomainUserHistoryItem,
  UserCollaborationHistory,
} from '@app/shared/application/dtos/my-collaborations.dto';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import {
  IDENTITY_SERVICE_NAME,
  IdentityServiceClient,
} from '@app/shared/infrastructure/grpc/stubs/identity';
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
import {
  CoreReportUsersPage,
  CoreReportsPort,
} from '../../application/ports/core-reports.port';

@Injectable()
export class GrpcCoreReportsAdapter implements CoreReportsPort, OnModuleInit {
  private readonly logger = new Logger(GrpcCoreReportsAdapter.name);

  private coreService!: ReportsServiceClient;
  private identityService!: IdentityServiceClient;

  constructor(
    @Inject(GrpcPackages.Reports.Client)
    private readonly coreGrpcClient: ClientGrpc,
    @Inject(GrpcPackages.Identity.Client)
    private readonly identityGrpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.coreService =
      this.coreGrpcClient.getService<ReportsServiceClient>(
        REPORTS_SERVICE_NAME,
      );
    this.identityService =
      this.identityGrpcClient.getService<IdentityServiceClient>(
        IDENTITY_SERVICE_NAME,
      );
  }

  listUsers(page?: number, search?: string): Promise<CoreReportUsersPage> {
    this.logger.debug('Fetching users from gRPC service...');
    return firstValueFrom(this.identityService.listUsers({ page, search }));
  }

  async getUserContributions(
    userId: string,
  ): Promise<UserCollaborationHistory> {
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
