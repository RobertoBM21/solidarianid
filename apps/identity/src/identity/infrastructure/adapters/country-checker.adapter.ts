import { Injectable } from '@nestjs/common';
import * as countries from 'i18n-iso-countries';
import { CountryCheckerPort } from '../../domain/ports/country-checker.port';

@Injectable()
export class CountryCheckerAdapter implements CountryCheckerPort {
  isValidCountryCode(countryCode: string): boolean {
    return countries.isValid(countryCode);
  }
}
