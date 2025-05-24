// 自动化注册、登录、发帖脚本
import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

const randomStr = () => Math.random().toString(36).slice(2, 10);

const testUser = {
  username: 'test_' + randomStr(),
  email: 'test_' + randomStr() + '@test.com',
  password: 'Test123456!'
};

async function register(user) {
  try {
    console.log('注册请求数据:', user);
    const res = await axios.post(`${API_BASE}/auth/register`, user);
    console.log('注册成功:', res.data);
    if (!res.data || res.data.status !== 'success') {
      throw new Error('注册接口响应异常: ' + JSON.stringify(res.data));
    }
    return res.data;
  } catch (e) {
    console.error('注册失败:', e.response?.data || e.message);
    return null;
  }
}

async function login(user) {
  try {
    console.log('登录请求数据:', { email: user.email, password: user.password });
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: user.email,
      password: user.password
    });
    console.log('登录成功:', res.data);
    if (!res.data || res.data.status !== 'success') {
      throw new Error('登录接口响应异常: ' + JSON.stringify(res.data));
    }
    return res.data.data.token;
  } catch (e) {
    console.error('登录失败:', e.response?.data || e.message);
    return null;
  }
}

async function createPost(token, content) {
  try {
    const postData = { content };
    console.log('发帖请求数据:', postData);
    const res = await axios.post(
      `${API_BASE}/posts`,
      postData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('发帖成功:', res.data);
    if (!res.data || res.data.status !== 'success') {
      throw new Error('发帖接口响应异常: ' + JSON.stringify(res.data));
    }
    return res.data;
  } catch (e) {
    console.error('发帖失败:', e.response?.data || e.message);
    return null;
  }
}

async function batchRegister(count = 5) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = {
      username: 'test_' + randomStr(),
      email: 'test_' + randomStr() + '@test.com',
      password: 'Test123456!'
    };
    const res = await register(user);
    if (res) users.push(user);
  }
  return users;
}

async function batchCreatePosts(token, count = 5) {
  const posts = [];
  for (let i = 0; i < count; i++) {
    const post = await createPost(token, '自动化测试发帖 ' + new Date().toLocaleString());
    if (post) posts.push(post);
  }
  return posts;
}

async function concurrentTest(count = 5) {
  const startTime = Date.now();
  const promises = [];
  for (let i = 0; i < count; i++) {
    const user = {
      username: 'test_' + randomStr(),
      email: 'test_' + randomStr() + '@test.com',
      password: 'Test123456!'
    };
    promises.push(register(user).then(async (res) => {
      if (res) {
        const token = await login(user);
        if (token) {
          await createPost(token, '并发测试发帖 ' + new Date().toLocaleString());
        }
      }
    }));
  }
  await Promise.all(promises);
  const endTime = Date.now();
  console.log(`并发测试完成，耗时: ${endTime - startTime}ms`);
}

async function cleanupTestData() {
  // 这里可以调用后端清理接口，或者直接删除测试数据
  console.log('清理测试数据...');
  // 示例：删除所有测试用户
  // await axios.delete(`${API_BASE}/users/test`);
}

(async () => {
  // 单用户测试
  await register(testUser);
  const token = await login(testUser);
  if (token) {
    await createPost(token, '自动化测试发帖 ' + new Date().toLocaleString());
  }

  // 批量测试
  const users = await batchRegister(3);
  for (const user of users) {
    const userToken = await login(user);
    if (userToken) {
      await batchCreatePosts(userToken, 2);
    }
  }

  // 并发测试
  await concurrentTest(5);

  // 清理测试数据
  await cleanupTestData();
})(); 