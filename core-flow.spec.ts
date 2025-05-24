import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const user1 = { email: 'test1@example.com', password: 'Test123456' };
const user2 = { email: 'test2@example.com', password: 'Test123456' };

test.describe('社交核心功能自动化测试', () => {
  test('未注册邮箱登录应提示“该邮箱未注册”', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'notexist@example.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=该邮箱未注册')).toBeVisible();
  });

  test('已注册邮箱+错误密码登录应提示“密码错误”', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', user1.email);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=密码错误')).toBeVisible();
  });

  test('已注册邮箱+正确密码登录应成功', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', user1.email);
    await page.fill('input[name="password"]', user1.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/feed/);
  });

  test('登录后发帖应立即显示', async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', user1.email);
    await page.fill('input[name="password"]', user1.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/feed/);

    // 发帖
    const postContent = `自动化测试发帖${Date.now()}`;
    await page.fill('textarea', postContent);
    await page.click('button:has-text("发布")');
    await expect(page.locator(`text=${postContent}`)).toBeVisible();
  });

  test('用户2登录并评论、点赞用户1的帖子', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', user2.email);
    await page.fill('input[name="password"]', user2.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/feed/);

    // 找到最新一条帖子
    const post = page.locator('.post-card').first();

    // 评论
    await post.locator('button:has-text("评论")').click();
    const commentContent = `自动化测试评论${Date.now()}`;
    await post.locator('textarea').fill(commentContent);
    await post.locator('button:has-text("发送")').click();
    await expect(post.locator(`text=${commentContent}`)).toBeVisible();

    // 点赞
    await post.locator('button:has-text("点赞")').click();
    // 检查点赞数+1（如有显示）
    // await expect(post.locator('.like-count')).toHaveText('1');
  });

  test('用户1收到通知', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', user1.email);
    await page.fill('input[name="password"]', user1.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/feed/);

    // 进入通知页面
    await page.click('a:has-text("通知")');
    // 检查是否有“评论”或“点赞”相关通知
    await expect(page.locator('text=评论')).toBeVisible();
    await expect(page.locator('text=点赞')).toBeVisible();
  });

  test('未登录用户不能评论或点赞', async ({ page }) => {
    await page.goto(`${BASE_URL}/feed`);
    const post = page.locator('.post-card').first();
    await post.locator('button:has-text("评论")').click();
    await expect(page.locator('text=登录')).toBeVisible();

    await post.locator('button:has-text("点赞")').click();
    await expect(page.locator('text=登录')).toBeVisible();
  });
});