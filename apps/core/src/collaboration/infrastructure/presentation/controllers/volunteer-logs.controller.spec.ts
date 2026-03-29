import { left, right } from '@app/shared/domain';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { CreateVolunteerLogDto } from '../../../application/dtos/create-volunteer-log.dto';
import { VolunteerLogDto } from '../../../application/dtos/volunteer-log.dto';
import { VolunteerLogPort } from '../../../application/ports/volunteer-log.port';
import {
  CancellationTooLateError,
  VolunteerLogNotOwnedError,
} from '../../../domain/aggregates/volunteer-log.aggregate';
import { VolunteerLogNotFoundError } from '../../../domain/repositories/volunteer-log.repository';
import { VolunteerLogsController } from './volunteer-logs.controller';

describe('VolunteerLogsController', () => {
  let controller: VolunteerLogsController;

  const mockPort = {
    register: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VolunteerLogsController],
      providers: [
        {
          provide: VolunteerLogPort,
          useValue: mockPort,
        },
      ],
    }).compile();

    controller = module.get<VolunteerLogsController>(VolunteerLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a log successfully', async () => {
      const dto: CreateVolunteerLogDto = {
        volunteeringActionId: v4(),
        start: new Date(),
        end: new Date(),
      };

      const resultDto = {
        id: v4(),
        volunteeringActionId: v4(),
        volunteerId: v4(),
        start: dto.start.toISOString(),
        end: dto.end.toISOString(),
      } as VolunteerLogDto;

      mockPort.register.mockResolvedValue(right(resultDto));

      const result = await controller.createLog(dto, 'user-1');
      expect(result).toEqual(resultDto);
    });

    it('should throw BadRequestException on failure', async () => {
      const dto: CreateVolunteerLogDto = {
        volunteeringActionId: v4(),
        start: new Date(),
        end: new Date(),
      };

      mockPort.register.mockResolvedValue(left(new Error('Invalid dates')));

      await expect(controller.createLog(dto, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelLog', () => {
    it('should cancel log successfully', async () => {
      mockPort.cancel.mockResolvedValue(right(undefined));

      const [logId, userId] = [v4(), v4()];

      await controller.cancelLog(logId, userId);
      expect(mockPort.cancel).toHaveBeenCalledWith(logId, userId);
    });

    it('should throw NotFoundException if log not found', async () => {
      mockPort.cancel.mockResolvedValue(
        left(new VolunteerLogNotFoundError(v4())),
      );

      await expect(controller.cancelLog(v4(), v4())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if log does not belong to user', async () => {
      mockPort.cancel.mockResolvedValue(left(new VolunteerLogNotOwnedError()));

      await expect(controller.cancelLog(v4(), v4())).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if cancellation checks fail', async () => {
      mockPort.cancel.mockResolvedValue(left(new CancellationTooLateError()));

      await expect(controller.cancelLog(v4(), v4())).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
