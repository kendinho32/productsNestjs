import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, GetUserDecorator, RoleProtected } from './decorators';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetHeadersDecorator } from '../common/decorators/get-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (validation error, unique constraint violation)',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User login successfully',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'refresh token' })
  @ApiResponse({
    status: 200,
    description: 'refresh token successfully',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'User not authenticate',
  })
  @Auth()
  refresh(@GetUserDecorator() user: User) {
    return this.authService.refreshToken(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUserDecorator() user: User,
    @GetHeadersDecorator() headers: string[],
  ) {
    return {
      ok: true,
      message: user.full_name,
      headers,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superAdmin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRouteWithRoles(
    @GetUserDecorator() user: User,
    @GetHeadersDecorator() headers: string[],
  ) {
    return {
      ok: true,
      message: user.full_name,
      headers,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.superAdmin)
  private3RouteWithRoles(
    @GetUserDecorator() user: User,
    @GetHeadersDecorator() headers: string[],
  ) {
    return {
      ok: true,
      message: user.full_name,
      headers,
    };
  }
}
