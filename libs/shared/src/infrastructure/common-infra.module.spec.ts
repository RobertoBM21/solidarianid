import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { NatsClientAdapter } from './adapters/nats-client.adapter';
import { CommonInfrastructureModule } from './common-infra.module';

describe('CommonInfrastructureModule', () => {
  let module: TestingModule;

  const mockNatsAdapter = {
    setupIntegrationEvents: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonInfrastructureModule],
    })
      .overrideProvider(NatsClientAdapter)
      .useValue(mockNatsAdapter)
      .overrideProvider(DataSource)
      .useValue({
        createEntityManager: jest.fn(),
        hasMetadata: jest.fn(),
      })
      .compile();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should setup integration events on init', async () => {
    const mockSubscription = { unsubscribe: jest.fn() };
    mockNatsAdapter.setupIntegrationEvents.mockReturnValue(mockSubscription);
    await module.init();

    expect(mockNatsAdapter.setupIntegrationEvents).toHaveBeenCalled();
  });

  it('should teardown subscription on destroy', () => {
    const mockSubscription = { unsubscribe: jest.fn() };
    mockNatsAdapter.setupIntegrationEvents.mockReturnValue(mockSubscription);

    const infra = module.get<CommonInfrastructureModule>(
      CommonInfrastructureModule,
    );
    infra.onModuleInit();
    infra.onModuleDestroy();

    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should handle no subscription on destroy', () => {
    const infra = module.get<CommonInfrastructureModule>(
      CommonInfrastructureModule,
    );
    infra.onModuleDestroy();

    expect(true).toBe(true); // Just ensure no errors are thrown
  });
});
