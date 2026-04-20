export interface CreateDonationPayload {
  fundingActionId: string;
  amount: number;
}

export interface PaymentLinkResponse {
  url: string;
}

export interface DonationResponse {
  id: string;
  fundingActionId: string;
  amount: number;
  donorId: string;
  createdAt: string;
}
