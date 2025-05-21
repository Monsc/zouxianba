const Joi = require('joi');

const validateRoom = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': '房间标题不能为空',
        'string.min': '房间标题至少需要1个字符',
        'string.max': '房间标题不能超过100个字符',
        'any.required': '房间标题是必填项'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': '房间描述不能超过500个字符'
      }),
    isPrivate: Joi.boolean()
      .default(false),
    settings: Joi.object({
      allowChat: Joi.boolean()
        .default(true),
      allowReactions: Joi.boolean()
        .default(true),
      allowBackgroundMusic: Joi.boolean()
        .default(true),
      allowSpeechToText: Joi.boolean()
        .default(true)
    })
  });

  return schema.validate(data);
};

const validateRoomSettings = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .messages({
        'string.empty': '房间标题不能为空',
        'string.min': '房间标题至少需要1个字符',
        'string.max': '房间标题不能超过100个字符'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': '房间描述不能超过500个字符'
      }),
    isPrivate: Joi.boolean(),
    settings: Joi.object({
      allowChat: Joi.boolean(),
      allowReactions: Joi.boolean(),
      allowBackgroundMusic: Joi.boolean(),
      allowSpeechToText: Joi.boolean()
    })
  });

  return schema.validate(data);
};

const validatePermissions = (data) => {
  const schema = Joi.object({
    moderators: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .required()
      .messages({
        'array.base': '管理员列表必须是数组',
        'any.required': '管理员列表是必填项'
      })
  });

  return schema.validate(data);
};

module.exports = {
  validateRoom,
  validateRoomSettings,
  validatePermissions
}; 