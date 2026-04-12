import { CauseData } from '../dtos/cause.dto';

export abstract class CauseDataGetterPort {
  abstract getCauseData(
    communityId: string,
    causeId: string,
  ): Promise<CauseData | null>;
}
