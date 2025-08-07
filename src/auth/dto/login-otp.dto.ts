import { IsString, IsNotEmpty, IsMobilePhone, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginOtpDto {
  @ApiProperty({ description: 'The phone number used for OTP login' })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone(undefined, { strictMode: false }, { message: 'Please provide a valid phone number' })
  phoneNumber: string;

  @ApiProperty({ description: 'The OTP received' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'OTP must be between 4 and 6 digits' })
  otp: string;
}
