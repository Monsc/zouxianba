// 注册+登录 E2E 测试脚本

describe('注册与登录流程', () => {
  const email = `test+${Date.now()}@zouxianba.com`;
  const password = 'testpassword';
  const username = `e2euser${Date.now()}`;

  it('注册新账号并自动登录', () => {
    cy.visit('http://localhost:5173/register');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button').contains('注册').click();

    // 断言首页有"发布动态"按钮
    cy.contains('发布动态').should('exist');
  });

  it('退出后可用新账号登录', () => {
    // 等待首页渲染完成
    cy.contains('发布动态').should('exist');
    // 点击第一个头像
    cy.get('img').first().click();
    cy.contains('退出登录').click({ force: true });
    cy.url().should('include', '/login');

    cy.visit('http://localhost:5173/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button').contains('登录').click();

    // 断言已登录
    cy.contains('发布动态').should('exist');
  });

  // 新增测试用例：注册后发帖再退出
  it('注册后发帖再退出', () => {
    cy.visit('http://localhost:5173/register');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button').contains('注册').click();

    // 等待首页渲染
    cy.contains('发布动态', { timeout: 10000 }).should('exist');

    // 发帖
    cy.contains('发布动态').click();
    cy.get('textarea').type('这是一条测试动态');
    cy.get('button').contains('发布').click();
    cy.contains('发布成功', { timeout: 10000 }).should('exist');

    // 退出登录
    cy.get('img').first().click();
    cy.contains('退出登录').click({ force: true });
    cy.url().should('include', '/login');
  });
}); 