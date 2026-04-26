import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { FirebaseLoginDto, FirebaseRegisterDto, GoogleLoginDto, GoogleRegisterDto, LoginDto, RegisterDto } from './dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('firebase/login')
  firebaseLogin(@Body() dto: FirebaseLoginDto) {
    return this.auth.loginWithFirebase(dto);
  }

  @Post('firebase/register')
  firebaseRegister(@Body() dto: FirebaseRegisterDto) {
    return this.auth.registerWithFirebase(dto);
  }

  @Post('google/login')
  googleLogin(@Body() dto: GoogleLoginDto) {
    return this.auth.loginWithGoogle(dto);
  }

  @Post('google/register')
  googleRegister(@Body() dto: GoogleRegisterDto) {
    return this.auth.registerWithGoogle(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Get('organizations')
  getOrganizations() {
    return this.auth.getOrganizations();
  }
}
