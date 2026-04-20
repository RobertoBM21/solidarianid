import type { CauseAction, FundingAction } from './cause.models';

export interface CreateFundingActionPayload {
  title: string;
  description: string;
  objectives: string[];
  targetAmount: number;
}

export type CreateFundingActionResponse = FundingAction;

export interface CauseActionDetail {
  causeId: string;
  causeTitle: string;
  communityId: string;
  communityName: string;
  action: CauseAction;
}
