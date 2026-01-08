import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

// Setup some globals for supertest
global.TextEncoder = TextEncoder;
// @ts-expect-error // specific definition issue in some node versions
global.TextDecoder = TextDecoder;
