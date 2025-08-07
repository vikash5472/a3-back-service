import { IsString, IsNotEmpty, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ description: 'The phone number to send OTP to' })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone(
    undefined,
    { strictMode: false },
    { message: 'Please provide a valid phone number' },
  )
  phoneNumber: string;
}
