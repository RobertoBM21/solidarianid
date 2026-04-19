import {
  ActionDefEntity,
  FundingActionDef,
  VolunteeringActionDef,
} from '../../domain/entities/action.entity';

export class FundingActionOutDto {
  /**
   * The unique identifier of the action.
   */
  readonly id: string;
  /**
   * The unique identifier of the cause.
   */
  readonly causeId: string;
  /**
   * The action type.
   */
  readonly type: 'funding';
  /**
   * The title of the action.
   */
  readonly title: string;
  /**
   * The description of the action.
   */
  readonly description: string;
  /**
   * The objectives of the action.
   */
  readonly objectives: string[];
  /**
   * Whether the action is closed.
   */
  readonly closed: boolean;
  /**
   * The creation date in ISO 8601 format.
   */
  readonly createdAt: string;
  /**
   * The target amount for the funding action.
   */
  readonly targetAmount: number;

  constructor(action: FundingActionDef) {
    this.id = action.id.toString();
    this.causeId = action.causeId.toString();
    this.type = 'funding';
    this.title = action.title;
    this.description = action.description;
    this.objectives = [...action.objectives];
    this.closed = action.closed;
    this.createdAt = action.createdAt.toISOString();
    this.targetAmount = action.targetAmountValue;
  }
}

export class VolunteeringActionOutDto {
  /**
   * The unique identifier of the action.
   */
  readonly id: string;
  /**
   * The unique identifier of the cause.
   */
  readonly causeId: string;
  /**
   * The action type.
   */
  readonly type: 'volunteering';
  /**
   * The title of the action.
   */
  readonly title: string;
  /**
   * The description of the action.
   */
  readonly description: string;
  /**
   * The objectives of the action.
   */
  readonly objectives: string[];
  /**
   * Whether the action is closed.
   */
  readonly closed: boolean;
  /**
   * The creation date in ISO 8601 format.
   */
  readonly createdAt: string;
  /**
   * The start date in ISO 8601 format.
   */
  readonly start: string;
  /**
   * The end date in ISO 8601 format.
   */
  readonly end: string;

  constructor(action: VolunteeringActionDef) {
    this.id = action.id.toString();
    this.causeId = action.causeId.toString();
    this.type = 'volunteering';
    this.title = action.title;
    this.description = action.description;
    this.objectives = [...action.objectives];
    this.closed = action.closed;
    this.createdAt = action.createdAt.toISOString();
    this.start = action.start.toISOString();
    this.end = action.end.toISOString();
  }
}

export type ActionOutDto = FundingActionOutDto | VolunteeringActionOutDto;

export function mapActionToOutDto(action: ActionDefEntity): ActionOutDto {
  if (action instanceof FundingActionDef) {
    return new FundingActionOutDto(action);
  }
  if (action instanceof VolunteeringActionDef) {
    return new VolunteeringActionOutDto(action);
  }
  throw new Error('Unknown action subtype');
}
