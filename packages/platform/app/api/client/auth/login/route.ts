'use server'

import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

/**
 * 用户登录接口 (供 react-app 客户端使用)
 */
export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json()

		if (!email || !password) {
			return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
		}

		const user = await prisma.user.findUnique({
			where: { email },
		})

		if (!user) {
			return NextResponse.json({ error: '用户不存在' }, { status: 401 })
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)

		if (!isPasswordValid) {
			return NextResponse.json({ error: '密码错误' }, { status: 401 })
		}

		// 返回用户信息（不包含密码）
		return NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		})
	} catch (error) {
		console.error('Login error:', error)
		return NextResponse.json({ error: '登录失败' }, { status: 500 })
	}
}
