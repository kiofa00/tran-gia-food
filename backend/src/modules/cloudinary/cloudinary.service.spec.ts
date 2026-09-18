import { BadRequestException } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Writable } from 'stream';

import { CloudinaryService } from './cloudinary.service';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Configuration (Fail-Fast)', () => {
    it('should configure via CLOUDINARY_URL successfully', () => {
      process.env.CLOUDINARY_URL = 'cloudinary://123456:abcdef@mycloud';
      service = new CloudinaryService();
      expect(() => service.onModuleInit()).not.toThrow();
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloudinary_url: 'cloudinary://123456:abcdef@mycloud',
      });
    });

    it('should configure via individual credentials successfully', () => {
      delete process.env.CLOUDINARY_URL;
      process.env.CLOUDINARY_CLOUD_NAME = 'mycloud';
      process.env.CLOUDINARY_API_KEY = '123456';
      process.env.CLOUDINARY_API_SECRET = 'abcdef';

      service = new CloudinaryService();
      expect(() => service.onModuleInit()).not.toThrow();
      expect(cloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'mycloud',
        api_key: '123456',
        api_secret: 'abcdef',
        secure: true,
      });
    });

    it('should throw an explicit error when Cloudinary configuration is missing', () => {
      delete process.env.CLOUDINARY_URL;
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      service = new CloudinaryService();
      expect(() => service.onModuleInit()).toThrow(
        'Cloudinary configuration is missing. Please provide CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in .env',
      );
    });
  });

  describe('uploadAvatar', () => {
    beforeEach(() => {
      process.env.CLOUDINARY_URL = 'cloudinary://123456:abcdef@mycloud';
      service = new CloudinaryService();
      service.onModuleInit();
    });

    it('should throw BadRequestException when file is not an allowed image format', async () => {
      const invalidFile = {
        originalname: 'document.pdf',
        buffer: Buffer.from('fake-pdf'),
        mimetype: 'application/pdf',
      };

      await expect(service.uploadAvatar('user-1', invalidFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully upload an image and return the secure_url', async () => {
      const mockResult: Partial<UploadApiResponse> = {
        secure_url:
          'https://res.cloudinary.com/mycloud/image/upload/v1/trangia_food/avatars/avatar-1.jpg',
      };

      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        // Simulate streaming by calling callback asynchronously
        process.nextTick(() => callback(null, mockResult as UploadApiResponse));
        // Return a writable stream
        return new Writable({
          write(_chunk, _encoding, next) {
            next();
          },
        });
      });

      const validFile = {
        originalname: 'avatar.png',
        buffer: Buffer.from('fake-image-bytes'),
        mimetype: 'image/png',
      };

      const result = await service.uploadAvatar('user-1', validFile);
      expect(result).toEqual({ avatarUrl: mockResult.secure_url });
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'trangia_food/avatars',
          resource_type: 'image',
        }),
        expect.any(Function),
      );
    });

    it('should reject with BadRequestException when Cloudinary upload stream errors', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_options, callback) => {
        process.nextTick(() => callback(new Error('Cloudinary server unavailable'), null));
        return new Writable({
          write(_chunk, _encoding, next) {
            next();
          },
        });
      });

      const validFile = {
        originalname: 'avatar.jpg',
        buffer: Buffer.from('fake-image-bytes'),
        mimetype: 'image/jpeg',
      };

      await expect(service.uploadAvatar('user-1', validFile)).rejects.toThrow(BadRequestException);
    });
  });
});
