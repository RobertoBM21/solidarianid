import {
  DomainEventsPort,
  Either,
  left,
  right,
  UniqueEntityID,
} from '@app/shared/domain';
import { Injectable } from '@nestjs/common';
import { UserIsNotAdminError } from '../../domain/community.aggregate';
import {
  MembershipRequestStatus,
  MembershipRequestVerdict,
} from '../../domain/membership-request-status.enum';
import {
  MembershipRequest,
  MembershipRequestAlreadyExistsError,
  MembershipRequestCreationError,
  MembershipRequestNotPendingError,
  UserAlreadyMemberError,
} from '../../domain/membership-request.aggregate';
import { MembershipRequestsPort } from '../ports/membership-requests.port';
import { CommunityMemberRepository } from '../../domain/repositories/community-member.repository';
import {
  CommunityNotFoundError,
  CommunityRepository,
} from '../../domain/repositories/community.repository';
import {
  MembershipRequestNotFoundError,
  MembershipRequestRepository,
} from '../../domain/repositories/membership-request.repository';
import { MembershipRequestOutDto } from '../dtos/membership-out.dto';

@Injectable()
export class MembershipRequestsService implements MembershipRequestsPort {
  constructor(
    private readonly membershipRepository: MembershipRequestRepository,
    private readonly communityRepository: CommunityRepository,
    private readonly memberRepository: CommunityMemberRepository,
    private readonly domainEvents: DomainEventsPort,
  ) {}

  async requestMembership(
    userId: string,
    communityId: string,
  ): Promise<
    Either<
      | CommunityNotFoundError
      | MembershipRequestAlreadyExistsError
      | MembershipRequestCreationError
      | UserAlreadyMemberError,
      MembershipRequestOutDto
    >
  > {
    const user = UniqueEntityID.create(userId);
    const community = UniqueEntityID.create(communityId);

    const communityExists = await this.communityRepository.exists(community);
    if (!communityExists) {
      return left(new CommunityNotFoundError(communityId));
    }

    const memberOrError =
      await this.memberRepository.findByCommunityIdAndUserId(community, user);
    if (memberOrError.isRight()) {
      return left(new UserAlreadyMemberError());
    }

    const existingRequest =
      await this.membershipRepository.findByUserAndCommunity(user, community);
    if (existingRequest.isRight()) {
      return left(new MembershipRequestAlreadyExistsError());
    }

    const result = MembershipRequest.create({
      communityId: communityId,
      userId: userId,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    await this.membershipRepository.save(result.value);

    const dto = new MembershipRequestOutDto(result.value);
    return right(dto);
  }

  async listUserRequests(userId: string): Promise<MembershipRequestOutDto[]> {
    const requests = await this.membershipRepository.findByUserId(
      UniqueEntityID.create(userId),
    );
    return requests.map((request) => new MembershipRequestOutDto(request));
  }

  async listPendingRequests(
    adminId: string,
    communityId: string,
  ): Promise<
    Either<
      CommunityNotFoundError | UserIsNotAdminError,
      MembershipRequestOutDto[]
    >
  > {
    const admin = UniqueEntityID.create(adminId);
    const commId = UniqueEntityID.create(communityId);

    const communityOrError = await this.communityRepository.findById(commId);
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }

    const community = communityOrError.value;
    if (!community.admins.has(admin)) {
      return left(new UserIsNotAdminError(communityId));
    }

    const requests =
      await this.membershipRepository.findPendingByCommunityId(commId);
    return right(
      requests.map((request) => new MembershipRequestOutDto(request)),
    );
  }

  async reviewRequest(
    adminId: string,
    requestId: string,
    verdict: MembershipRequestVerdict,
  ): Promise<
    Either<
      | MembershipRequestNotFoundError
      | CommunityNotFoundError
      | UserIsNotAdminError
      | MembershipRequestNotPendingError,
      MembershipRequestOutDto
    >
  > {
    const admin = UniqueEntityID.create(adminId);
    const reqId = UniqueEntityID.create(requestId);

    const requestOrError = await this.membershipRepository.findById(reqId);
    if (requestOrError.isLeft()) {
      return left(requestOrError.value);
    }
    const request = requestOrError.value;

    const communityOrError = await this.communityRepository.findById(
      request.communityId,
    );
    if (communityOrError.isLeft()) {
      return left(communityOrError.value);
    }

    const community = communityOrError.value;
    if (!community.admins.has(admin)) {
      return left(new UserIsNotAdminError(request.communityId.toString()));
    }

    const updateResult =
      verdict === MembershipRequestStatus.ACCEPTED
        ? request.accept()
        : request.reject();

    if (updateResult.isLeft()) {
      return left(updateResult.value);
    }

    await this.membershipRepository.save(request);

    await this.domainEvents.dispatch(request);

    const dto = new MembershipRequestOutDto(request);
    return right(dto);
  }
}
