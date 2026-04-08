import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { ActionOutDto } from './action-out.dto';

export class CauseDto {
  /**
   * The ID of the cause
   */
  readonly id: string;

  /**
   * The ID of the community the cause belongs to
   */
  readonly communityId: string;

  /**
   * Whether the cause is closed
   */
  readonly closed: boolean;

  /**
   * Whether the current user supports this cause (only present when authenticated)
   */
  readonly supportedByUser?: boolean;

  /**
   * Actions associated with this cause
   */
  readonly actions: ActionOutDto[];

  constructor(
    cause: CauseAggr,
    supportedByUser: boolean | undefined,
    actions: ActionOutDto[],
  ) {
    this.id = cause.id.toString();
    this.communityId = cause.communityId.toString();
    this.closed = cause.closed;
    this.supportedByUser = supportedByUser;
    this.actions = actions;
  }
}
