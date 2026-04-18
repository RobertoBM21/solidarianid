export class DonationIntentionDto {
  constructor(
    public readonly fundingActionId: string,
    public readonly donorId: string,
    public readonly amount: number,
  ) {}
}
