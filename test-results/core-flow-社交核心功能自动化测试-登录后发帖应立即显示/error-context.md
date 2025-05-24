# Test info

- Name: 社交核心功能自动化测试 >> 登录后发帖应立即显示
- Location: C:\Users\Main\Desktop\zxb\core-flow.spec.ts:32:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /feed/
Received string:  "http://localhost:3001/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="zh-CN" class="light">…</html>
      - unexpected value "http://localhost:3001/login"

    at C:\Users\Main\Desktop\zxb\core-flow.spec.ts:38:24
```

# Page snapshot

```yaml
- heading "登录账号" [level=2]
- paragraph:
  - text: 还没有账号？
  - link "立即注册":
    - /url: /register
- text: 邮箱地址
- textbox "邮箱地址": test1@example.com
- text: 密码
- textbox "密码": Test123456
- checkbox "记住我"
- text: 记住我
- link "忘记密码？":
  - /url: /forgot-password
- button "登录中..." [disabled]
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | const BASE_URL = 'http://localhost:3001';
   4 | const user1 = { email: 'test1@example.com', password: 'Test123456' };
   5 | const user2 = { email: 'test2@example.com', password: 'Test123456' };
   6 |
   7 | test.describe('社交核心功能自动化测试', () => {
   8 |   test('未注册邮箱登录应提示“该邮箱未注册”', async ({ page }) => {
   9 |     await page.goto(`${BASE_URL}/login`);
  10 |     await page.fill('input[name="email"]', 'notexist@example.com');
  11 |     await page.fill('input[name="password"]', '123456');
  12 |     await page.click('button[type="submit"]');
  13 |     await expect(page.locator('text=该邮箱未注册')).toBeVisible();
  14 |   });
  15 |
  16 |   test('已注册邮箱+错误密码登录应提示“密码错误”', async ({ page }) => {
  17 |     await page.goto(`${BASE_URL}/login`);
  18 |     await page.fill('input[name="email"]', user1.email);
  19 |     await page.fill('input[name="password"]', 'wrongpassword');
  20 |     await page.click('button[type="submit"]');
  21 |     await expect(page.locator('text=密码错误')).toBeVisible();
  22 |   });
  23 |
  24 |   test('已注册邮箱+正确密码登录应成功', async ({ page }) => {
  25 |     await page.goto(`${BASE_URL}/login`);
  26 |     await page.fill('input[name="email"]', user1.email);
  27 |     await page.fill('input[name="password"]', user1.password);
  28 |     await page.click('button[type="submit"]');
  29 |     await expect(page).toHaveURL(/feed/);
  30 |   });
  31 |
  32 |   test('登录后发帖应立即显示', async ({ page }) => {
  33 |     // 登录
  34 |     await page.goto(`${BASE_URL}/login`);
  35 |     await page.fill('input[name="email"]', user1.email);
  36 |     await page.fill('input[name="password"]', user1.password);
  37 |     await page.click('button[type="submit"]');
> 38 |     await expect(page).toHaveURL(/feed/);
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  39 |
  40 |     // 发帖
  41 |     const postContent = `自动化测试发帖${Date.now()}`;
  42 |     await page.fill('textarea', postContent);
  43 |     await page.click('button:has-text("发布")');
  44 |     await expect(page.locator(`text=${postContent}`)).toBeVisible();
  45 |   });
  46 |
  47 |   test('用户2登录并评论、点赞用户1的帖子', async ({ page }) => {
  48 |     await page.goto(`${BASE_URL}/login`);
  49 |     await page.fill('input[name="email"]', user2.email);
  50 |     await page.fill('input[name="password"]', user2.password);
  51 |     await page.click('button[type="submit"]');
  52 |     await expect(page).toHaveURL(/feed/);
  53 |
  54 |     // 找到最新一条帖子
  55 |     const post = page.locator('.post-card').first();
  56 |
  57 |     // 评论
  58 |     await post.locator('button:has-text("评论")').click();
  59 |     const commentContent = `自动化测试评论${Date.now()}`;
  60 |     await post.locator('textarea').fill(commentContent);
  61 |     await post.locator('button:has-text("发送")').click();
  62 |     await expect(post.locator(`text=${commentContent}`)).toBeVisible();
  63 |
  64 |     // 点赞
  65 |     await post.locator('button:has-text("点赞")').click();
  66 |     // 检查点赞数+1（如有显示）
  67 |     // await expect(post.locator('.like-count')).toHaveText('1');
  68 |   });
  69 |
  70 |   test('用户1收到通知', async ({ page }) => {
  71 |     await page.goto(`${BASE_URL}/login`);
  72 |     await page.fill('input[name="email"]', user1.email);
  73 |     await page.fill('input[name="password"]', user1.password);
  74 |     await page.click('button[type="submit"]');
  75 |     await expect(page).toHaveURL(/feed/);
  76 |
  77 |     // 进入通知页面
  78 |     await page.click('a:has-text("通知")');
  79 |     // 检查是否有“评论”或“点赞”相关通知
  80 |     await expect(page.locator('text=评论')).toBeVisible();
  81 |     await expect(page.locator('text=点赞')).toBeVisible();
  82 |   });
  83 |
  84 |   test('未登录用户不能评论或点赞', async ({ page }) => {
  85 |     await page.goto(`${BASE_URL}/feed`);
  86 |     const post = page.locator('.post-card').first();
  87 |     await post.locator('button:has-text("评论")').click();
  88 |     await expect(page.locator('text=登录')).toBeVisible();
  89 |
  90 |     await post.locator('button:has-text("点赞")').click();
  91 |     await expect(page.locator('text=登录')).toBeVisible();
  92 |   });
  93 | });
```