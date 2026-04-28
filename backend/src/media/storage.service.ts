import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

export type StoredObject = {
  provider: 'local' | 'cloudflare-r2';
  key: string;
  path: string;
  url?: string;
  bucket?: string;
  sizeBytes: number;
};

@Injectable()
export class StorageService {
  private readonly r2Client?: S3Client;

  constructor(private readonly config: ConfigService) {
    if (this.config.get<boolean>('r2.enabled')) {
      this.r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.config.getOrThrow<string>('r2.accountId')}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.getOrThrow<string>('r2.accessKeyId'),
          secretAccessKey: this.config.getOrThrow<string>('r2.secretAccessKey'),
        },
      });
    }
  }

  async storeUploadedFile(file: Express.Multer.File, mediaType: string): Promise<StoredObject> {
    if (!this.r2Client) return this.localObject(file);

    const bucket = this.config.getOrThrow<string>('r2.bucket');
    const key = `reports/${mediaType}/${Date.now()}-${basename(file.filename)}`;
    await this.r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: createReadStream(file.path),
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          originalName: encodeURIComponent(file.originalname),
        },
      }),
    );

    const publicBaseUrl = this.config.get<string>('r2.publicBaseUrl');
    return {
      provider: 'cloudflare-r2',
      bucket,
      key,
      path: file.path,
      url: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${key}` : undefined,
      sizeBytes: file.size,
    };
  }

  async storeJsonObject(key: string, data: unknown): Promise<StoredObject> {
    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    if (!this.r2Client) {
      const uploadDir = this.config.get<string>('uploads.dir', 'uploads');
      const localPath = join(uploadDir, key);
      await mkdir(dirname(localPath), { recursive: true });
      await writeFile(localPath, buffer);
      return {
        provider: 'local',
        key,
        path: localPath,
        url: join('/uploads', key),
        sizeBytes: buffer.length,
      };
    }

    const bucket = this.config.getOrThrow<string>('r2.bucket');
    await this.r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/json',
        ContentLength: buffer.length,
      }),
    );

    const publicBaseUrl = this.config.get<string>('r2.publicBaseUrl');
    return {
      provider: 'cloudflare-r2',
      bucket,
      key,
      path: key,
      url: publicBaseUrl ? `${publicBaseUrl.replace(/\/$/, '')}/${key}` : undefined,
      sizeBytes: buffer.length,
    };
  }

  private localObject(file: Express.Multer.File): StoredObject {
    return {
      provider: 'local',
      key: file.filename,
      path: file.path,
      url: join('/uploads', file.filename),
      sizeBytes: file.size,
    };
  }
}
