import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SendEmailDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Incorrect email' })
  email: string

  @IsNotEmpty({ message: 'The "theme" field is required' })
  @IsString({ message: 'Subject must be a string' })
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  theme: string

  @IsNotEmpty({ message: 'The "description" field is required' })
  @IsString({ message: 'Content must be a string' })
  @MaxLength(5000, { message: 'Content must not exceed 5000 characters' })
  description: string

  @IsNotEmpty({ message: 'The "token" field is required' })
  @IsString({ message: 'Captcha token must be a string' })
  token: string
}
