import { DomainEventError } from './domain-events.port';

describe('DomainEventsPort', () => {
  it('should create a domain event error', () => {
    const domainEventError = new DomainEventError('A test message');
    expect(domainEventError).toBeInstanceOf(DomainEventError);
  });
});
