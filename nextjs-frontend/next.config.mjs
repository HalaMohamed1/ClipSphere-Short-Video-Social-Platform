import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Monorepo: parent folder has backend package-lock.json; anchor standalone tracing explicitly. */
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
