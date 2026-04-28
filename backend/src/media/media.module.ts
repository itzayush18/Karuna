import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageService } from './storage.service';
import { allowedMediaMimeTypes } from './media.constants';
import { AiModule } from '../ai/ai.module';
import { UrgencyModule } from '../urgency/urgency.module';

@Module({
  imports: [
    AiModule,
    UrgencyModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uploadDir = config.get<string>('uploads.dir', 'uploads');
        const maxFileSizeMb = config.get<number>('uploads.maxFileSizeMb', 20);
        return {
          dest: uploadDir,
          limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
          fileFilter: (
            _req: unknown,
            file: Express.Multer.File,
            cb: (error: Error | null, acceptFile: boolean) => void,
          ) => {
            cb(null, allowedMediaMimeTypes.has(file.mimetype));
          },
        };
      },
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService],
})
export class MediaModule {}
