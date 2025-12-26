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
	getApps(): Promise<IDifyAppItem[]>
	/**
	 * 通过 ID 获取应用，多应用模式下使用
	 */
	getAppByID(id: string): Promise<IDifyAppItem>
}

class AppService implements IAppStorageAdapter {
	private getHeaders() {
		const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)
		return userId ? { 'x-user-id': userId } : {}
	}

	private get baseRequest() {
		return new BaseRequest({
			baseURL: config.PUBLIC_APP_API_BASE as string,
			headers: this.getHeaders(),
		})
	}

	async getApps(): Promise<IDifyAppItem[]> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			return debugApps
		}

		const result = await this.baseRequest.get('/apps')
		return Promise.resolve(result)
	}

	async getAppByID(id: string): Promise<IDifyAppItem> {
		// 检查是否开启调试模式
		if (isDebugMode()) {
			const debugApps = getDebugApps()
			const debugApp = debugApps.find(app => app.id === id)
			if (debugApp) {
				return debugApp
			}
		}

		const appList = await this.getApps()
		return Promise.resolve(appList.find(item => item.id === id) as IDifyAppItem)
	}
}

export default new AppService()
