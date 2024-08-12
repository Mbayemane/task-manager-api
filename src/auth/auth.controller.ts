import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
  Put,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dtos/login-request.dt';
import { Public } from 'src/public.decorator';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserRequestDto } from './dtos/update-auth-request.dto';

@ApiTags('Auth')
@Controller('auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: LoginRequest) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @Public()
  register(@Body() user: RegisterRequestDto) {
    return this.authService.register(user);
  }

  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Headers('Authorization') auth: string) {
    const jwt = auth.replace('Bearer ', '');
    return this.authService.refreshAccessToken(jwt);
  }

  @ApiBearerAuth()
  @Put('profils')
  update(
    @Headers('Authorization') auth: string,
    @Body() user: UpdateUserRequestDto,
  ) {
    const jwt = auth.replace('Bearer ', '');
    return this.authService.updateUser(jwt, user);
  }

  @ApiBearerAuth()
  @Get('profils')
  getUser(
    @Headers('Authorization') auth: string,
  ) {
    const jwt = auth.replace('Bearer ', '');
    return this.authService.getUser(jwt);
  }
}
