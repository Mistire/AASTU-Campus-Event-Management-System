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

  /** TELEGRAM — send deep link; EMAIL — send PDF to parentEmail; STUDENT_EMAIL — bundle to student */
  @IsEnum(['TELEGRAM', 'EMAIL', 'STUDENT_EMAIL'])
  deliveryMethod: 'TELEGRAM' | 'EMAIL' | 'STUDENT_EMAIL';

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

  /**
   * Used when any parent has deliveryMethod === 'STUDENT_EMAIL'.
   * If omitted the student's own invitation email is used.
   */
  @IsOptional()
  @IsEmail()
  deliveryEmail?: string;
}

// ─── Graduation Tier Config ────────────────────────────────────────────────────

export class SaveGraduationConfigDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  distinguishedMinGpa: number;

  @IsNumber()
  @Min(0)
  @Max(5)
  honorsMinGpa: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  distinguishedSlots: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  honorsSlots: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  graduateSlots: number;
}
