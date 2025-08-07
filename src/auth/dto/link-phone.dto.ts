import { IsString, IsNotEmpty, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkPhoneDto {
  @ApiProperty({ description: 'The phone number to link to the user account' })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone(
    undefined,
    { strictMode: false },
    { message: 'Please provide a valid phone number' },
  )
  phoneNumber: string;
}
