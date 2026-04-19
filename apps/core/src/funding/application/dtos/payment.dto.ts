export class PaymentDto {
  /**
   * Payment URL to redirect the donor to complete the payment process.
   */
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }
}
