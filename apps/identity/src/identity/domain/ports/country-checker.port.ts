export abstract class CountryCheckerPort {
  abstract isValidCountryCode(countryCode: string): boolean;
}
