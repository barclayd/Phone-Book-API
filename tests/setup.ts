import 'dotenv/config';
jest.setTimeout(30000);

// @ts-ignore
global.console = {
  // silence console.logs() for tests
  log: jest.fn(),
  // support showing the following in test output when specified in code or tests whilst debugging
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};
