import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guard';

@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check media service health' })
  healthCheck() {
    return { status: 'ok', message: 'Media service is reachable' };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single media file (Event thumbnail, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const service = new MediaService();
          cb(null, service.generateFileName(file));
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      this.logger.error('Upload attempt failed: No file provided');
      throw new BadRequestException('File is required');
    }
    
    this.logger.log(`Successfully uploaded file: ${file.filename} (${file.size} bytes)`);
    
    return {
      url: this.mediaService.getPublicUrl(file.filename),
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
