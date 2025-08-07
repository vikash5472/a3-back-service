import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}