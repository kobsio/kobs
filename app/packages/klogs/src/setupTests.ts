import '@testing-library/jest-dom';
import matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

expect.extend(matchers);

// monaco-yaml has some cursed imports, which break the tests
// therefore we just mock the `setDiagnosticsOptions` method,
// which is used inside @kobsio/core
vi.mock('monaco-yaml', () => {
  return {
    setDiagnosticsOptions: vi.fn(),
  };
});

// xterm uses HTMLCanvas inside of core.
// The lib throws errors in our test output, when this isn't defined
HTMLCanvasElement.prototype.getContext = () => {
  return null;
};

afterEach(() => {
  cleanup();
});
