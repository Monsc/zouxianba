import request from './request';
import { getToken } from './auth';

// 启用双因素认证
export const enable2FA = async () => {
  const response = await request.post('/auth/2fa/enable');
  return {
    secret: response.secret,
    qrCode: response.qrCode,
  };
};

// 验证双因素认证
export const verify2FA = async (code: string) => {
  return request.post('/auth/2fa/verify', { code });
};

// 禁用双因素认证
export const disable2FA = async (code: string) => {
  return request.post('/auth/2fa/disable', { code });
};

// 生成备用码
export const generateBackupCodes = async () => {
  const response = await request.post('/auth/2fa/backup-codes');
  return response.codes;
};

// 验证备用码
export const verifyBackupCode = async (code: string) => {
  return request.post('/auth/2fa/verify-backup', { code });
};

// 检查双因素认证状态
export const check2FAStatus = async () => {
  const response = await request.get('/auth/2fa/status');
  return {
    enabled: response.enabled,
    verified: response.verified,
  };
};

// 登录时验证双因素认证
export const verify2FALogin = async (code: string) => {
  const response = await request.post('/auth/2fa/login', { code });
  return {
    token: response.token,
    csrfToken: response.csrfToken,
  };
};

// 获取双因素认证设置
export const get2FASettings = async () => {
  const response = await request.get('/auth/2fa/settings');
  return {
    enabled: response.enabled,
    verified: response.verified,
    backupCodesRemaining: response.backupCodesRemaining,
    lastUsed: response.lastUsed,
  };
};

// 更新双因素认证设置
export const update2FASettings = async (settings: {
  requireOnLogin: boolean;
  requireOnPasswordChange: boolean;
  requireOnSensitiveAction: boolean;
}) => {
  return request.put('/auth/2fa/settings', settings);
};

// 验证双因素认证码
export const validate2FACode = (code: string): boolean => {
  // 验证码必须是 6 位数字
  return /^\d{6}$/.test(code);
};

// 验证备用码
export const validateBackupCode = (code: string): boolean => {
  // 备用码必须是 8 位字母数字组合
  return /^[A-Z0-9]{8}$/.test(code);
}; 