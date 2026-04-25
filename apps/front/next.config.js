//@ts-check

const { composePlugins, withNx } = require('@nx/next');

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: false,
  dynamicStartUrl: false,
  reloadOnOnline: false,
  cacheStartUrl: false,
  swSrc: 'worker/index.js',
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  output: 'standalone',
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withPWA,
];

module.exports = composePlugins(...plugins)(nextConfig);
