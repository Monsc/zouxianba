import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { FileFilterCallback, File as MulterFile } from 'multer';

const storage = multer.diskStorage({
  destination: function (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
  // 只允许图片和视频
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); 