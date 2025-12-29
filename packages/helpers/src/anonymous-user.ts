import { generateUuidV4 } from './id'
import { LocalStorageKeys, LocalStorageStore } from './localstorage'

/**
 * 获取或生成匿名用户 ID
 * 用于多租户模式下区分不同的未登录用户
 * 如果 localStorage 中已存在则返回，否则生成新的并存储
 */
export const getAnonymousUserId = (): string => {
	let anonymousId = LocalStorageStore.get(LocalStorageKeys.ANONYMOUS_ID)

	if (!anonymousId) {
		// 生成一个短一点的 ID，取 UUID 的前 8 位
		anonymousId = generateUuidV4().split('-')[0]
		LocalStorageStore.set(LocalStorageKeys.ANONYMOUS_ID, anonymousId)
	}

	return anonymousId
}

/**
 * 生成租户模式下的用户标识
 * 格式: {tenantCode}_{anonymousId}
 * 这样同一租户下的不同用户有独立的会话
 */
export const getTenantUserId = (tenantCode: string): string => {
	const anonymousId = getAnonymousUserId()
	return `${tenantCode}_${anonymousId}`
}
