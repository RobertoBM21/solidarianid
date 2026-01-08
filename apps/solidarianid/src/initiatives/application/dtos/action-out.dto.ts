import {
  Action,
  FundingAction,
  VolunteeringAction,
} from '../../domain/aggregates/action.aggregate';

abstract class BaseActionOutDto {
  readonly id: string;
  readonly causeId: string;
  readonly title: string;
  readonly description: string;
  readonly objectives: string[];
  readonly closed: boolean;
  readonly createdAt: string;

  constructor(action: Action) {
    this.id = action.id.toString();
    this.causeId = action.causeId.toString();
    this.title = action.title;
    this.description = action.description;
    this.objectives = [...action.objectives];
    this.closed = action.closed;
    this.createdAt = action.createdAt.toISOString();
  }
}

export class FundingActionOutDto extends BaseActionOutDto {
  type = 'funding' as const;
  readonly targetAmount: number;
  readonly currentAmount: number;

  constructor(action: FundingAction) {
    super(action);
    this.targetAmount = action.targetAmountValue;
    this.currentAmount = action.currentAmountValue;
  }
}

export class VolunteeringActionOutDto extends BaseActionOutDto {
  type = 'volunteering' as const;
  readonly start: string;
  readonly end: string;

  constructor(action: VolunteeringAction) {
    super(action);
    this.start = action.start.toISOString();
    this.end = action.end.toISOString();
  }
}

export type ActionOutDto = FundingActionOutDto | VolunteeringActionOutDto;

export function mapActionToOutDto(action: Action): ActionOutDto {
  switch (action.constructor) {
    case FundingAction:
      return new FundingActionOutDto(action as FundingAction);
    case VolunteeringAction:
      return new VolunteeringActionOutDto(action as VolunteeringAction);
    default:
      throw new Error('Unknown action subtype');
  }
}
