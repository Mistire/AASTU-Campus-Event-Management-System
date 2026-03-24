import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFormFieldDto {
  @ApiProperty({ description: 'Label for the form field', example: 'T-Shirt Size' })
  @IsString()
  @IsNotEmpty()
  fieldLabel: string;

  @ApiProperty({
    description: 'Type of form field',
    example: 'SELECT',
    enum: ['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'NUMBER', 'DATE', 'FILE'],
  })
  @IsString()
  @IsNotEmpty()
  fieldType: string;

  @ApiProperty({ description: 'Whether this field is mandatory', example: true })
  @IsBoolean()
  @IsNotEmpty()
  isRequired: boolean;

  @ApiPropertyOptional({
    description: 'Comma-separated options for SELECT/RADIO/CHECKBOX fields',
    example: 'S,M,L,XL',
  })
  @IsString()
  @IsOptional()
  options?: string;
}

export class UpdateFormFieldDto {
  @ApiPropertyOptional({ description: 'Label for the form field' })
  @IsString()
  @IsOptional()
  fieldLabel?: string;

  @ApiPropertyOptional({
    description: 'Type of form field',
    enum: ['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'NUMBER', 'DATE', 'FILE'],
  })
  @IsString()
  @IsOptional()
  fieldType?: string;

  @ApiPropertyOptional({ description: 'Whether this field is mandatory' })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Comma-separated options for SELECT/RADIO/CHECKBOX fields' })
  @IsString()
  @IsOptional()
  options?: string;
}
