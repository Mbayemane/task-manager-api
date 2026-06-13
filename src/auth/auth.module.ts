import { Module } from '@nestjs/common';
import { MailService } from 'src/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './utils/constant';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailService],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '216000s' },
    }),
  ],
})
export class AuthModule {}
