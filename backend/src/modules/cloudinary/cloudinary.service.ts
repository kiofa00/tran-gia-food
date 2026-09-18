import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  onModuleInit() {
    this.configure();
  }

  configure() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudinaryUrl) {
      cloudinary.config({ cloudinary_url: cloudinaryUrl });
      this.logger.log('Cloudinary configured via CLOUDINARY_URL');
      return;
    }

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log(`Cloudinary configured for cloud_name: ${cloudName}`);
      return;
    }

    throw new Error(
      'Cloudinary configuration is missing. Please provide CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in .env',
    );
  }

  async uploadAvatar(
    userId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
  ): Promise<{ avatarUrl: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const ext = file.originalname.includes('.')
      ? file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase()
      : '';
    const extToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    const effectiveMimeType =
      file.mimetype && file.mimetype !== 'application/octet-stream'
        ? file.mimetype
        : extToMime[ext] || file.mimetype;

    if (!allowedMimeTypes.includes(effectiveMimeType)) {
      throw new BadRequestException('Chỉ chấp nhận định dạng ảnh (JPEG, PNG, WEBP, GIF)');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'trangia_food/avatars',
          public_id: `avatar-${userId}-${Date.now()}`,
          resource_type: 'image',
          transformation: [
            {
              width: 500,
              height: 500,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(
              new BadRequestException(error?.message || 'Lỗi khi upload ảnh lên Cloudinary'),
            );
          }
          resolve({ avatarUrl: result.secure_url });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
