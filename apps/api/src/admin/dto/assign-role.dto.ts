import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID('4')
  roleId: string;
}

export class ListUserQueryDto {
  @IsOptional()
  @IsUUID('4')
  roleId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
