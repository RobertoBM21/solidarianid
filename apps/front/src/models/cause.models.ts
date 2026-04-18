export interface FundingAction {
  id: string;
  causeId: string;
  type: 'funding';
  title: string;
  description: string;
  objectives: string[];
  closed: boolean;
  createdAt: string;
  targetAmount: number;
  currentAmount: number;
}

export interface VolunteeringAction {
  id: string;
  causeId: string;
  type: 'volunteering';
  title: string;
  description: string;
  objectives: string[];
  closed: boolean;
  createdAt: string;
  start: string;
  end: string;
}

export type CauseAction = FundingAction | VolunteeringAction;

export interface CauseDetail {
  id: string;
  communityId: string;
  communityName: string;
  title: string;
  description: string;
  duration: string;
  ods: number;
  closed: boolean;
  createdAt: string;
  supportedByUser?: boolean;
  isCommunityAdmin?: boolean;
  actions: CauseAction[];
}

export interface CreateCausePayload {
  title: string;
  description: string;
  duration: string;
  ods: number;
}

export interface CreateCauseResponse {
  id: string;
  title: string;
  description: string;
  duration: string;
  ods: number;
  closed: boolean;
  createdAt: string;
}
