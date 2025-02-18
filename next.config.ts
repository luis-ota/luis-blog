import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    basePath: '/luis-blog',
    assetPrefix: '/luis-blog/',
    images: { unoptimized: true},
};

export default nextConfig;
