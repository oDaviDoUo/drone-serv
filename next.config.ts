// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "removeViewBox",
                  active: false
                }
              ]
            },
            // Пропускаем title/desc, если не нужны
            titleProp: true,
            ref: true
          }
        }
      ]
    });

    return config;
  },
  // при необходимости добавь другие опции Next.js здесь
};

export default nextConfig;
