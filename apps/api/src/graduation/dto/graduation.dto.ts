import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddStudentDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  gpa: number;
}

export class ParentEntryDto {
  @IsString()
  @IsNotEmpty()
  parentLabel: string; // "Parent 1", "Parent 2", etc.

  @IsEnum(['TELEGRAM', 'EMAIL'])
  deliveryMethod: 'TELEGRAM' | 'EMAIL';

  @IsOptional()
  @IsString()
  telegramUsername?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;
}

export class ClaimSubmissionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ParentEntryDto)
  parents: ParentEntryDto[];
}
