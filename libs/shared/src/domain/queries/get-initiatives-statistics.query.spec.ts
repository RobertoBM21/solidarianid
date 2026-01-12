import { GetInitiativesStatisticsQuery } from './get-initiatives-statistics.query';

describe('GetInitiativesStatisticsQuery', () => {
  it('should create an instance of GetInitiativesStatisticsQuery', () => {
    const query = new GetInitiativesStatisticsQuery();
    expect(query).toBeInstanceOf(GetInitiativesStatisticsQuery);
  });
});
