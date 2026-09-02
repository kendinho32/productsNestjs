import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CommonService } from '../common/common.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly NAME_SERVICE: string = 'AuthService';
  private readonly log: Logger = new Logger(this.NAME_SERVICE);
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly saltOrRounds = 10;

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, this.saltOrRounds);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    try {
      await this.userRepository.save(user);
    } catch (err) {
      this.log.error('Error creating user', err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.commonService.handlerException(err);
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_active: user.isActive,
      token: await this.buildJwtToken({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true, full_name: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    return {
      id: user.id,
      email: user.email,
      token: await this.buildJwtToken({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      }),
    };
  }

  async refreshToken(user: User) {
    return {
      ...user,
      token: await this.buildJwtToken({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      }),
    };
  }

  private buildJwtToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }
}
