import { ArrayUnique, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class UpdateUserInterestsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  interestIds: string[];
}

export class UpdateUserCategoryPreferencesDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
