import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateVenueDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  building?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
