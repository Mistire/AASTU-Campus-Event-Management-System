import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'uuid-5678' })
  userId: string;

  @ApiProperty({ example: 'Event Approved' })
  title: string;

  @ApiProperty({ example: 'Your event "Tech Talk" has been approved.' })
  message: string;

  @ApiProperty({ example: 'EVENT_APPROVED' })
  type: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationDto] })
  data: NotificationDto[];

  @ApiProperty({
    example: { total: 42, page: 1, limit: 20, totalPages: 3 },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class UnreadCountResponseDto {
  @ApiProperty({ example: 5 })
  count: number;
}
