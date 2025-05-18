import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (_req: any, _file: any, cb: any) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (_req: any, file: any, cb: any) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (_req: any, file: any, cb: any) => {
  // 只允许图片和视频
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); 