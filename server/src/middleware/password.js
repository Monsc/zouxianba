const { 
  PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIRE_UPPERCASE,
  PASSWORD_REQUIRE_LOWERCASE,
  PASSWORD_REQUIRE_NUMBERS,
  PASSWORD_REQUIRE_SPECIAL
} = process.env;

// 密码验证规则
const passwordRules = {
  minLength: parseInt(PASSWORD_MIN_LENGTH) || 8,
  requireUppercase: PASSWORD_REQUIRE_UPPERCASE === 'true',
  requireLowercase: PASSWORD_REQUIRE_LOWERCASE === 'true',
  requireNumbers: PASSWORD_REQUIRE_NUMBERS === 'true',
  requireSpecial: PASSWORD_REQUIRE_SPECIAL === 'true'
};

// 验证密码强度
const validatePassword = (password) => {
  const errors = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`密码长度至少为 ${passwordRules.minLength} 个字符`);
  }

  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }

  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }

  if (passwordRules.requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含数字');
  }

  if (passwordRules.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 密码策略中间件
const passwordPolicy = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next();
  }

  const { isValid, errors } = validatePassword(password);

  if (!isValid) {
    return res.status(400).json({
      error: 'Password validation failed',
      message: '密码不符合安全要求',
      details: errors
    });
  }

  next();
};

module.exports = {
  passwordPolicy,
  validatePassword
}; 