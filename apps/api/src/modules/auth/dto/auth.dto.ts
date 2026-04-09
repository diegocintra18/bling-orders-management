import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Type(() => String)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Type(() => String)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Type(() => String)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  name: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => String)
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
