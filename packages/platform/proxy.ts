import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// CORS 头配置
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
	'Access-Control-Allow-Headers':
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-USER-ID, x-user-id, x-tenant-code',
	'Access-Control-Max-Age': '86400',
}

export async function proxy(request: NextRequest) {
	const { pathname, origin } = request.nextUrl

	// 处理 API 的 CORS 预检请求
	if (pathname.startsWith('/api') && request.method === 'OPTIONS') {
		return new NextResponse(null, {
			status: 204,
			headers: corsHeaders,
		})
	}

	// 为 API 请求添加 CORS 头
	if (pathname.startsWith('/api')) {
		const response = NextResponse.next()
		Object.entries(corsHeaders).forEach(([key, value]) => {
			response.headers.set(key, value)
		})
		return response
	}

	// 跳过静态资源
	if (pathname.startsWith('/_next') || pathname === '/favicon.ico') return NextResponse.next()

	// 允许访问初始化页面本身
	if (pathname.startsWith('/init')) return NextResponse.next()

	try {
		const res = await fetch(`${origin}/api/init/status`, { cache: 'no-store' })
		const data = await res.json()
		const isInitialized = !!data.initialized

		if (!isInitialized) {
			const url = new URL('/init', request.url)
			return NextResponse.redirect(url)
		}
	} catch (error) {
		console.error('初始化状态检查失败:', error)
		// 状态检查失败时不阻断访问，允许后续页面处理
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
