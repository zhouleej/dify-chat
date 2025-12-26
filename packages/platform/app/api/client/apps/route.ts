'use server'

import { NextRequest, NextResponse } from 'next/server'

import { createSafeApp, handleApiError } from '@/lib/api-utils'
import { getAppListByTenantCode, getAppListByUserId, getPublicAppList } from '@/repository/app'

/**
 * 获取应用列表 (供客户端使用)
 *
 * 支持三种模式：
 * 1. 租户模式：通过 x-tenant-code header 获取租户应用 + 公共应用
 * 2. 用户模式：通过 x-user-id header 获取用户应用 + 公共应用
 * 3. 公共模式：不传任何 header，仅返回公共应用
 *
 * @returns 应用列表，但不包含敏感的 API Key
 */
export async function GET(request: NextRequest) {
	try {
		const tenantCode = request.headers.get('x-tenant-code')
		const userId = request.headers.get('x-user-id')

		let apps
		const publicApps = await getPublicAppList()

		if (tenantCode) {
			// 租户模式：返回该租户的应用 + 公共应用
			const tenantApps = await getAppListByTenantCode(tenantCode)
			const appIds = new Set(tenantApps.map(app => app.id))
			apps = [...tenantApps, ...publicApps.filter(app => !appIds.has(app.id))]
		} else if (userId) {
			// 用户模式：返回该用户的应用 + 公共应用
			const userApps = await getAppListByUserId(userId)
			const appIds = new Set(userApps.map(app => app.id))
			apps = [...userApps, ...publicApps.filter(app => !appIds.has(app.id))]
		} else {
			// 公共模式：仅返回公共应用
			apps = publicApps
		}

		// 过滤敏感信息，不返回 API Key 到客户端
		const safeApps = apps.map(createSafeApp)

		return NextResponse.json(safeApps)
	} catch (error) {
		return handleApiError(error, 'Error fetching apps for client')
	}
}
