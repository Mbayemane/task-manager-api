import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginRequest } from './dtos/login-request.dt';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './utils/constant';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { UpdateUserRequestDto } from './dtos/update-auth-request.dto';
import { MailService } from 'src/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private resetCodes = new Map<string, { code: string; expires: number }>();

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

  async sendResetCode(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Email introuvable');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000;
    this.resetCodes.set(email, { code, expires });
    await this.mailService.sendResetCode(email, code);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const entry = this.resetCodes.get(email);
    if (!entry) throw new UnauthorizedException('Code invalide');
    if (Date.now() > entry.expires) {
      this.resetCodes.delete(email);
      throw new UnauthorizedException('Code expire');
    }
    if (entry.code !== code) throw new UnauthorizedException('Code incorrect');
    await this.usersService.updatePasswordByEmail(email, newPassword);
    this.resetCodes.delete(email);
  }

  generateRefreshToken(user: any) {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '7d',
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
