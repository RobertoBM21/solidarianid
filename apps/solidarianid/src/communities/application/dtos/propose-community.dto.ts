import { IsString } from 'class-validator';

export class ProposeCommunityDto {
  /**
   * Community name.
   * @example 'Comunidad Solidaria'
   */
  @IsString()
  name: string;

  /**
   * Community description.
   * @example 'Comunidad para iniciativas locales'
   */
  @IsString()
  description: string;
}
