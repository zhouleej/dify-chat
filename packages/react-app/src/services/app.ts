import { IDifyAppItem } from '@dify-chat/core'
import { BaseRequest, LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'

import { getDebugApps, isDebugMode } from '@/components/debug-mode'
import config from '@/config'

// 支持多种存储方式
interface IAppStorageAdapter {
	/**
	 * 获取应用列表
	 * 如果是单应用模式，将会直接取第一个
	 */
	getApps(tenantCode?: string): Promise<IDifyAppItem[]>
	/**
	 * 通过 ID 获取应用，多应用模式下使用
	 */
	getAppByID(id: string, tenantCode?: string): Promise<IDifyAppItem>
}

class AppService implements IAppStorageAdapter {
	private getHeaders(tenantCode?: string) {
		const headers: Record<string, string> = {}

		if (tenantCode) {
			// 租户模式
			headers['x-tenant-code'] = tenantCode
		} else {
			// 用户模式
			const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)
			if (userId) {
				headers['x-user-id'] = userId
			}
		}

		return headers
	}

	private getBaseRequest(tenantCode?: string) {
		return new BaseRequest({
			baseURL: config.PUBLIC_APP_API_BASE as string,
			headers: this.getHeaders(tenantCode),
		})
	}

	async getApps(tenantCode?: string): Promise<IDifyAppItem[]> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			return debugApps
		}

		const result = await this.getBaseRequest(tenantCode).get('/apps')
		return Promise.resolve(result)
	}

	async getAppByID(id: string, tenantCode?: string): Promise<IDifyAppItem> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			const debugApp = debugApps.find(app => app.id === id)
			if (debugApp) {
				return debugApp
			}
		}

		const appList = await this.getApps(tenantCode)
		return Promise.resolve(appList.find(item => item.id === id) as IDifyAppItem)
	}
}

export default new AppService()
