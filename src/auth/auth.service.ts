import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginRequest } from './dtos/login-request.dt';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './utils/constant';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { UpdateUserRequestDto } from './dtos/update-auth-request.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(user: RegisterRequestDto) {
    return this.usersService.create(user);
  }

  async validateUser(data: LoginRequest): Promise<any> {
    const user = await this.usersService.findOne(data.username);
    if (user && (await bcrypt.compare(data.password, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(data: LoginRequest): Promise<any> {
    const user = await this.validateUser(data);
    if (user != undefined && user != null) {
      return this.getJwt(user);
    } else {
      throw new UnauthorizedException();
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const user = this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret,
      });
      return this.getJwt(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateUser(token: string, updateUserRequestDto: UpdateUserRequestDto) {
    try {
      const user = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      return this.usersService.update(user.sub, updateUserRequestDto);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUser(token: string) {
    try {
      const user = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      return this.usersService.findById(user.sub);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  generateRefreshToken(user: any) {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '7d', // Refresh token expires in 7 days
    });
  }

  getJwt(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
        expiresIn: '7d',
      }),
      refresh_token: this.generateRefreshToken(user),
    };
  }
}
