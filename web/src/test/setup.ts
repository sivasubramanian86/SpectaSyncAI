/**
 * @fileoverview Vitest setup configuration.
 * Initializes testing library jest-dom extensions and global polyfills.
 */
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Polyfill ResizeObserver for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Polyfill crypto.randomUUID for useDashboardData
if (!window.crypto) {
  // @ts-ignore
  window.crypto = {};
}
if (!window.crypto.randomUUID) {
  // @ts-ignore
  window.crypto.randomUUID = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
