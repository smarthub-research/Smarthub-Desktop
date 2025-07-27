/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    devIndicators: false,
    images: {
        unoptimized: true // Required for Electron
    },
};

export default nextConfig;
