import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserPort } from '../../domain/ports/user.port';
import { CreateUserResponseDto } from '../dtos/create-user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly userService: UserPort) {}

  @Post()
  @ApiBody({ type: CreateUserResponseDto })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: CreateUserResponseDto,
  })
  async createUser(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const result = await this.userService.createUser(dto);
    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }
    const response = new CreateUserResponseDto();
    response.userId = result.value.id;
    return response;
  }
}
