import { Body, Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MediaService } from './media.service';

class ManualTranscriptDto {
  @IsString()
  @MinLength(2)
  transcript: string;
}

@ApiTags('media')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'reports/:reportId/media', version: '1' })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  attach(@Param('reportId') reportId: string, @UploadedFile() file: Express.Multer.File) {
    return this.media.attach(reportId, file);
  }

  @Post(':mediaId/transcript')
  addTranscript(
    @Param('reportId') reportId: string,
    @Param('mediaId') mediaId: string,
    @Body() dto: ManualTranscriptDto,
  ) {
    return this.media.addManualTranscript(reportId, mediaId, dto.transcript);
  }
}
