import { initSentry } from './sentry';

const sentryInitMock = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  init: (...args: unknown[]) => sentryInitMock(...args),
}));

describe('initSentry', () => {
  afterEach(() => {
    sentryInitMock.mockReset();
    vi.unstubAllEnvs();
  });

  it('calls Sentry.init in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    initSentry();
    expect(sentryInitMock).toHaveBeenCalledOnce();
  });

  it('does not call Sentry.init in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    initSentry();
    expect(sentryInitMock).not.toHaveBeenCalled();
  });
});
