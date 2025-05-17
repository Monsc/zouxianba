// 注册后直接断言跳转到首页，并断言已登录状态

describe('Auth Flow', () => {
  const email = `test+e2e${Date.now()}@zouxianba.com`;
  const password = 'testpassword';
  const username = `e2euser${Date.now()}`;

  it('should register and be logged in', () => {
    // 注册
    cy.visit('http://localhost:5173/register');
    cy.get('input[name="username"]').should('be.visible').invoke('val', username).trigger('input');
    cy.get('input[name="email"]').should('be.visible').invoke('val', email).trigger('input');
    cy.get('input[name="password"]').should('be.visible').invoke('val', password).trigger('input');
    cy.get('button').contains('注册').click();

    // 断言注册后页面没有出现注册失败提示
    cy.contains('注册失败').should('not.exist');

    // 断言注册后页面跳转到首页
    cy.url().should('eq', 'http://localhost:5173/');

    // 断言页面有已登录特征（如用户名、退出登录按钮等）
    cy.contains(username).should('exist');
  });
}); 