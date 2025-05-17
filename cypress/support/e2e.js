// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err) => {
  // 忽略 Service Worker 注册失败的错误
  if (err.message && err.message.includes('Failed to register a ServiceWorker')) {
    return false;
  }
  // 其他异常继续抛出
});

// 兼容 Cypress 环境下 KeyboardEvent 可能为 undefined 的问题
if (typeof window !== 'undefined' && !window.KeyboardEvent) {
  window.KeyboardEvent = function() {};
}