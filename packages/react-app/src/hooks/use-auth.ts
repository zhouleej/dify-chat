import { LocalStorageKeys, LocalStorageStore } from '@dify-chat/helpers'
import { useHistory } from 'pure-react-router'

export interface IUserInfo {
	id: string
	email: string
	name: string
	role: string
}

/**
 * 授权 hook
 */
export const useAuth = () => {
	const history = useHistory()
	const userId = LocalStorageStore.get(LocalStorageKeys.USER_ID)
	const userInfoStr = LocalStorageStore.get(LocalStorageKeys.USER_INFO)
	const userInfo: IUserInfo | null = userInfoStr
		? typeof userInfoStr === 'string'
			? JSON.parse(userInfoStr)
			: userInfoStr
		: null

	/**
	 * 跳转登录页
	 */
	const goAuthorize = () => {
		history.push('/auth')
	}

	/**
	 * 登录成功后保存用户信息
	 */
	const saveUserInfo = (user: IUserInfo) => {
		LocalStorageStore.set(LocalStorageKeys.USER_ID, user.id)
		LocalStorageStore.set(LocalStorageKeys.USER_INFO, JSON.stringify(user))
	}

	/**
	 * 退出登录
	 */
	const logout = () => {
		LocalStorageStore.remove(LocalStorageKeys.USER_ID)
		LocalStorageStore.remove(LocalStorageKeys.USER_INFO)
		history.push('/auth')
	}

	return {
		isAuthorized: !!userId,
		goAuthorize,
		userId,
		userInfo,
		saveUserInfo,
		logout,
	}
}
