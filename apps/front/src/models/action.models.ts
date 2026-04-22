import type {
  CauseAction,
  FundingAction,
  VolunteeringAction,
} from './cause.models';

export interface CreateFundingActionPayload {
  title: string;
  description: string;
  objectives: string[];
  targetAmount: number;
}

export type CreateFundingActionResponse = FundingAction;

export interface CreateVolunteeringActionPayload {
  title: string;
  description: string;
  objectives: string[];
  start: string;
  end: string;
}

export type CreateVolunteeringActionResponse = VolunteeringAction;

export interface CauseActionDetail {
  causeId: string;
  causeTitle: string;
  communityId: string;
  communityName: string;
  action: CauseAction;
}
