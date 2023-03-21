import '@testing-library/jest-dom';
import matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

expect.extend(matchers);

vi.mock('monaco-yaml', () => {
  return {
    setDiagnosticsOptions: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
});
