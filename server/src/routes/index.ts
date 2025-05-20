import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import postRoutes from './post';
import commentRoutes from './comment';
import adminRoutes from './admin';
import emailTemplateRoutes from './admin/email-templates';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/email-templates', emailTemplateRoutes);

export default router; 