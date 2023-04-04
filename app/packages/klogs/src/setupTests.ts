import '@testing-library/jest-dom';
import matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

expect.extend(matchers);

// xterm uses HTMLCanvas inside of core.
// The lib throws errors in our test output, when this isn't defined
HTMLCanvasElement.prototype.getContext = () => {
  return null;
};

afterEach(() => {
  cleanup();
});
