import { defineConfig } from '@rsbuild/core'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSourceBuild } from '@rsbuild/plugin-source-build'
import path from 'path'
import tailwindcss from 'tailwindcss'

const tsconfigDevPath = path.resolve(__dirname, './tsconfig.json')
const tsconfigProdPath = path.resolve(__dirname, './tsconfig.prod.json')

export default defineConfig({
	source: {
		tsconfigPath: process.env.NODE_ENV === 'development' ? tsconfigDevPath : tsconfigProdPath,
		include: [{ not: /[\\/]core-js[\\/]/ }],
	},
	output: {
		polyfill: 'entry',
	},
	html: {
		template: path.resolve(__dirname, './public/template.html'),
	},
	plugins: [
		pluginSourceBuild(),
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
		compress: false, // 解决代理后流式输出失效的问题
		base: '/dify-chat',
		port: 5200,
		// 允许外部访问
		host: '0.0.0.0',
		proxy: [
			{
				// 代理 Dify API
				target: process.env.DIFY_API_DOMAIN || 'https://api.dify.ai',
				changeOrigin: true,
				context: process.env.DIFY_API_PREFIX || '/v1',
			},
		],
	},
	tools: {
		postcss: {
			postcssOptions: {
				plugins: [tailwindcss()],
			},
		},
	},
})
