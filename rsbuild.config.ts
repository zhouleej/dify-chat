import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import path from 'path';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  source: {
    define: {
      'process.env.DIFY_API_KEY': JSON.stringify(process.env.DIFY_API_KEY),
      'process.env.DIFY_APP_ID': JSON.stringify(process.env.DIFY_APP_ID),
      'process.env.DIFY_API_BASE': JSON.stringify(process.env.DIFY_API_BASE),
      'process.env.DIFY_API_VERSION': JSON.stringify(process.env.DIFY_API_VERSION),
    }
  },
  html: {
    template: path.resolve(__dirname, './public/template.html'),
  },
  plugins: [
    pluginReact(),
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          plugins: [],
          javascriptEnabled: true,
        },
      },
    }),
  ],
  server: {
		base: '/dify-chat',
    port: 5200,
    proxy: [
      {
        target: process.env.DIFY_API_BASE,
        changeOrigin: true,
        context: process.env.DIFY_API_VERSION,
      },
    ],
  },
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [tailwindcss()],
      }
    }
  }
});
