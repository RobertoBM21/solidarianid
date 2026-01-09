import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RabbitmqClientAdapter } from './adapters/rabbitmq-client.adapter';
import { CommonInfrastructureModule } from './common-infra.module';

describe('CommonInfrastructureModule', () => {
  let module: TestingModule;

  const mockRabbitAdapter = {
    setupIntegrationEvents: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonInfrastructureModule],
    })
      .overrideProvider(RabbitmqClientAdapter)
      .useValue(mockRabbitAdapter)
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
    mockRabbitAdapter.setupIntegrationEvents.mockReturnValue(mockSubscription);
    await module.init();

    expect(mockRabbitAdapter.setupIntegrationEvents).toHaveBeenCalled();
  });

  it('should teardown subscription on destroy', () => {
    const mockSubscription = { unsubscribe: jest.fn() };
    mockRabbitAdapter.setupIntegrationEvents.mockReturnValue(mockSubscription);

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
