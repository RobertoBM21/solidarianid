import { CauseAggr } from '../../domain/aggregates/cause.aggregate';
import { ActionOutDto } from './action-out.dto';

export class CauseData {
  /**
   * The name of the community the cause belongs to
   */
  readonly communityName: string;

  /**
   * The cause title
   */
  readonly title: string;

  /**
   * The cause description
   */
  readonly description: string;

  /**
   * The cause duration
   * @example "3 months"
   */
  readonly duration: string;

  /**
   * The cause ODS number
   */
  readonly ods: number;

  /**
   * Whether the cause is closed
   */
  readonly closed: boolean;

  /**
   * The date the cause was created
   */
  readonly createdAt: Date;

  constructor(causeData: CauseData) {
    this.communityName = causeData.communityName;
    this.title = causeData.title;
    this.description = causeData.description;
    this.duration = causeData.duration;
    this.ods = causeData.ods;
    this.closed = causeData.closed;
    this.createdAt = causeData.createdAt;
  }
}

export class CauseDto extends CauseData {
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
   * Whether the current user is an admin of the community that owns this cause
   */
  readonly isCommunityAdmin?: boolean;

  /**
   * Actions associated with this cause
   */
  readonly actions: ActionOutDto[];

  constructor(
    causeAggr: CauseAggr,
    causeData: CauseData,
    supportedByUser: boolean | undefined,
    isCommunityAdmin: boolean | undefined,
    actions: ActionOutDto[],
  ) {
    super(causeData);

    this.id = causeAggr.id.toString();
    this.communityId = causeAggr.communityId.toString();
    this.closed = causeAggr.closed;
    this.supportedByUser = supportedByUser;
    this.isCommunityAdmin = isCommunityAdmin;
    this.actions = actions;
  }
}
