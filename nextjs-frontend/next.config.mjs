/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * Standalone output bundles only what's needed to run the server,
   * keeping the production Docker image as small as possible.
   * Does not affect `next dev`.
   */
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
