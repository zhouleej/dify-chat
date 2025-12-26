'use server'

import { NextRequest, NextResponse } from 'next/server'

import { handleApiError } from '@/lib/api-utils'
import { getTenantByCode } from '@/repository/tenant'

/**
 * 根据租户 code 获取租户信息
 * 用于前端验证租户是否存在
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ code: string }> },
) {
	try {
		const { code } = await params
		const tenant = await getTenantByCode(code)

		if (!tenant) {
			return NextResponse.json({ error: '租户不存在' }, { status: 404 })
		}

		if (tenant.isEnabled !== 1) {
			return NextResponse.json({ error: '租户已禁用' }, { status: 403 })
		}

		return NextResponse.json({
			id: tenant.id,
			code: tenant.code,
			name: tenant.name,
			description: tenant.description,
		})
	} catch (error) {
		return handleApiError(error, 'Error fetching tenant')
	}
}
