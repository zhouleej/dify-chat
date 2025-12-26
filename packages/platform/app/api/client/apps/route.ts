'use server'

import { NextRequest, NextResponse } from 'next/server'

import { createSafeApp, handleApiError } from '@/lib/api-utils'
import { getAppList, getAppListByUserId } from '@/repository/app'

/**
 * 获取应用列表 (供客户端使用)
 *
 * @returns 应用列表，但不包含敏感的 API Key
 */
export async function GET(request: NextRequest) {
	try {
		const userId = request.headers.get('x-user-id')

		let apps
		if (userId) {
			// 获取该用户的应用 + 公共应用（没有 userId 的应用）
			const userApps = await getAppListByUserId(userId)
			const allApps = await getAppList()
			const publicApps = allApps.filter(app => !app.userId)
			// 合并并去重
			const appIds = new Set(userApps.map(app => app.id))
			apps = [...userApps, ...publicApps.filter(app => !appIds.has(app.id))]
		} else {
			// 没有用户ID时，只返回公共应用
			const allApps = await getAppList()
			apps = allApps.filter(app => !app.userId)
		}

		// 过滤敏感信息，不返回 API Key 到客户端
		const safeApps = apps.map(createSafeApp)

		return NextResponse.json(safeApps)
	} catch (error) {
		return handleApiError(error, 'Error fetching apps for client')
	}
}
