import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { EmailTemplateService } from '../../services/email-template.service';
import { validateRequest } from '../../middleware/validateRequest';
import { z } from 'zod';

const router = Router();
const emailTemplateService = EmailTemplateService.getInstance();

// 获取所有模板
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: '获取模板失败' });
  }
});

// 获取单个模板
router.get('/:id', auth, adminAuth, async (req, res) => {
  try {
    const template = await emailTemplateService.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: '获取模板失败' });
  }
});

// 更新模板
const updateTemplateSchema = z.object({
  subject: z.string().min(1),
  content: z.string().min(1),
});

router.put('/:id', auth, adminAuth, validateRequest(updateTemplateSchema), async (req, res) => {
  try {
    const { subject, content } = req.body;
    const template = await emailTemplateService.updateTemplate(req.params.id, { subject, content });
    if (!template) {
      return res.status(404).json({ message: '模板不存在' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: '更新模板失败' });
  }
});

// 预览模板
const previewTemplateSchema = z.object({
  data: z.record(z.string()),
});

router.post('/:id/preview', auth, adminAuth, validateRequest(previewTemplateSchema), async (req, res) => {
  try {
    const { data } = req.body;
    const html = await emailTemplateService.previewTemplate(req.params.id, data);
    res.json({ html });
  } catch (error) {
    res.status(500).json({ message: '预览模板失败' });
  }
});

export default router; 