/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.externals = [
      ...(config.externals || []),
      {
        canvg: 'canvg',
        html2canvas: 'html2canvas',
        dompurify: 'dompurify',
      },
    ];
    return config;
  },
};

export default nextConfig;

