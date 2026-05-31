import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export enum FeedbackQuestionType {
  RATING = 'RATING',
  TEXT = 'TEXT',
  SHORT_TEXT = 'SHORT_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SCALE = 'SCALE',
}

export class CreateFeedbackQuestionDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty({ enum: FeedbackQuestionType })
  @IsEnum(FeedbackQuestionType)
  type: FeedbackQuestionType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;
}

export class CreateFeedbackTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ type: [CreateFeedbackQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionDto)
  questions: CreateFeedbackQuestionDto[];
}
