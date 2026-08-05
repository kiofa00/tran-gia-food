import { IsString, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '0901234567', description: 'Số điện thoại Việt Nam' })
  @IsString()
  @Matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không hợp lệ (định dạng VN)',
  })
  phone: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456', description: 'Mã OTP 6 chữ số' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP phải là 6 chữ số' })
  otp: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token từ Firebase Auth / Google Sign-In' })
  @IsString()
  idToken: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
