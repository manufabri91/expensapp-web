import '@testing-library/jest-dom';

// jsdom doesn't polyfill these Web APIs. `jose` (pulled in transitively via next-auth/@auth/core
// whenever a test imports the `@/components` barrel, which re-exports every component including
// auth ones) needs TextEncoder/TextDecoder at import time.
import { TextDecoder, TextEncoder } from 'node:util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
