// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { SentryInit } from './SentryInit';

const initMock = vi.fn();
vi.mock('@/lib/sentry', () => ({
  initSentry: () => initMock(),
}));

describe('SentryInit', () => {
  it('calls initSentry on mount', () => {
    render(<SentryInit />);
    expect(initMock).toHaveBeenCalledOnce();
  });
});
