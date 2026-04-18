import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { CoreAuthClientPort } from '../../application/ports/core-auth-client.port';
import { AUTH_SERVICE_NAME } from '@app/shared/infrastructure/grpc/stubs/auth';
import { AuthServiceClient } from '@app/shared/infrastructure/grpc/stubs/auth';
import { GrpcPackages } from '@app/shared/infrastructure/grpc/grpc-packages';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { RegisterDto } from '../../application/dtos/register.dto';

interface GrpcLikeError {
  code?: number;
  details?: string;
  message?: string;
}

@Injectable()
export class CoreAuthGrpcAdapter implements CoreAuthClientPort, OnModuleInit {
  private service!: AuthServiceClient;
  private readonly logger = new Logger(CoreAuthGrpcAdapter.name);

  constructor(
    @Inject(GrpcPackages.Auth.Client) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<{ userId: string }> {
    try {
      const data = { email, password };
      return await firstValueFrom(this.service.validateCredentials(data));
    } catch (error) {
      this.handleGrpcError('validateCredentials', error);
    }
  }

  async registerUser(data: RegisterDto): Promise<{ userId: string }> {
    try {
      const request = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        city: data.city ?? '',
        country: data.country ?? '',
      };
      return await firstValueFrom(this.service.registerUser(request));
    } catch (error) {
      this.handleGrpcError('registerUser', error);
    }
  }

  async findOrCreateGoogleUser(
    email: string,
    name: string,
  ): Promise<{ userId: string }> {
    try {
      const data = { email, name };
      return await firstValueFrom(this.service.findOrCreateGoogleUser(data));
    } catch (error) {
      this.handleGrpcError('findOrCreateGoogleUser', error);
    }
  }

  private handleGrpcError(method: string, error: unknown): never {
    const grpcError = error as GrpcLikeError;
    const details =
      grpcError.details ?? grpcError.message ?? 'Internal server error';

    this.logger.error(`gRPC auth call failed in ${method}: ${details}`);

    switch (grpcError.code) {
      case status.UNAUTHENTICATED:
        throw new UnauthorizedException(details);
      case status.ALREADY_EXISTS:
        throw new ConflictException(details);
      case status.INVALID_ARGUMENT:
        throw new BadRequestException(details);
      case status.NOT_FOUND:
        throw new NotFoundException(details);
      default:
        throw new InternalServerErrorException(details);
    }
  }
}
