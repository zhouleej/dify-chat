'use server'

import { NextRequest } from 'next/server'

import {
	createDifyApiResponse,
	getUserIdFromRequest,
	handleApiError,
	proxyDifyRequest,
} from '@/lib/api-utils'
import { getAppItem } from '@/repository/app'

/**
 * 停止聊天消息生成
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ appId: string; taskId: string }> },
) {
	try {
		const { appId, taskId } = await params

		// 获取应用配置
		const app = await getAppItem(appId)
		if (!app) {
			return createDifyApiResponse({ error: 'App not found' }, 404)
		}

		// 获取请求体中的 user
		let bodyUser: string | undefined
		try {
			const body = await request.json()
			bodyUser = body.user
		} catch {
			// 请求体可能为空
		}

		// 获取用户ID：优先使用请求体中的 user，否则从请求头获取
		const userId = bodyUser || getUserIdFromRequest(request)

		// 代理请求到 Dify API
		const response = await proxyDifyRequest(
			app.requestConfig.apiBase,
			app.requestConfig.apiKey,
			`/chat-messages/${taskId}/stop`,
			{
				method: 'POST',
				body: JSON.stringify({
					user: userId,
				}),
			},
		)

		const data = await response.json()
		return createDifyApiResponse(data, response.status)
	} catch (error) {
		const resolvedParams = await params
		return handleApiError(
			error,
			`Error stopping chat message ${resolvedParams.taskId} for ${resolvedParams.appId}`,
		)
	}
}
