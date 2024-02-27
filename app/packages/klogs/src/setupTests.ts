import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

expect.extend(matchers);

/**
 * `LocalStorageMock` implements the `localStorage` interface, so that we can use it in our app for testing the
 * `useLocalStorageState` hook and the state history.
 */
class LocalStorageMock {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: Record<string, any> = {};

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setItem(key: string, value: any) {
    this.store[key] = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    return Object.keys(this.store)[index];
  }
}

global.localStorage = new LocalStorageMock();

/**
 * xterm uses HTMLCanvas inside of core. The lib throws errors in our test output, when this isn't defined.
 */
HTMLCanvasElement.prototype.getContext = () => {
  return null;
};

afterEach(() => {
  cleanup();
});
