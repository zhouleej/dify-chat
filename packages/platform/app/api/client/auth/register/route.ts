'use server'

import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

/**
 * 用户注册接口 (供 react-app 客户端使用)
 */
export async function POST(request: NextRequest) {
	try {
		const { email, password, name } = await request.json()

		if (!email || !password) {
			return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
		}

		// 检查用户是否已存在
		const existingUser = await prisma.user.findUnique({
			where: { email },
		})

		if (existingUser) {
			return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
		}

		// 加密密码
		const hashedPassword = await bcrypt.hash(password, 10)

		// 创建用户
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
				name: name || email.split('@')[0],
				role: 'user',
			},
		})

		return NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		})
	} catch (error) {
		console.error('Register error:', error)
		return NextResponse.json({ error: '注册失败' }, { status: 500 })
	}
}
