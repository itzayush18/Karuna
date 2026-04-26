import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class FirebaseLoginDto {
  @ApiProperty()
  @IsString()
  idToken: string;
}

export class FirebaseRegisterDto extends FirebaseLoginDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class GoogleLoginDto {
  @ApiProperty()
  @IsString()
  idToken: string;
}

export class GoogleRegisterDto extends GoogleLoginDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
