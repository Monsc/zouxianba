const cloudflare = require('cloudflare');
const config = require('../config');

const cf = new cloudflare({
  token: config.cloudflare.token
});

/**
 * 上传文件到 Cloudflare
 * @param {Buffer} buffer - 文件缓冲区
 * @param {string} filename - 文件名
 * @param {string} type - 文件类型 (image/audio)
 * @returns {Promise<string>} 文件 URL
 */
async function uploadToCloudflare(buffer, filename, type) {
  try {
    // 生成唯一的文件名
    const uniqueFilename = `${Date.now()}-${filename}`;
    const path = `${type}s/${uniqueFilename}`;

    // 上传文件到 Cloudflare
    const response = await cf.uploadFile({
      accountId: config.cloudflare.accountId,
      file: buffer,
      filename: uniqueFilename,
      path
    });

    // 返回文件 URL
    return `https://${config.cloudflare.zoneId}.r2.cloudflarestorage.com/${path}`;
  } catch (error) {
    console.error('Cloudflare upload error:', error);
    throw new Error('Failed to upload file to Cloudflare');
  }
}

const deleteFromCloudflare = async (url) => {
  try {
    const fileId = url.split('/').pop();
    await cf.deleteFile({
      accountId: config.cloudflare.accountId,
      zoneId: config.cloudflare.zoneId,
      fileId
    });
  } catch (err) {
    console.error('Cloudflare delete error:', err);
    throw new Error('文件删除失败');
  }
};

module.exports = {
  uploadToCloudflare,
  deleteFromCloudflare
}; 