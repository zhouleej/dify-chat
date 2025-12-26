import { BaseRequest } from '@dify-chat/helpers'

import config from '@/config'

export interface IUser {
	id: string
	email: string
	name: string
	role: string
}

export interface ILoginParams {
	email: string
	password: string
}

export interface IRegisterParams {
	email: string
	password: string
	name?: string
}

const baseRequest = new BaseRequest({
	baseURL: config.PUBLIC_APP_API_BASE as string,
})

class AuthService {
	/**
	 * 用户登录
	 */
	async login(params: ILoginParams): Promise<IUser> {
		const result = await baseRequest.post('/auth/login', params)
		return result
	}

	/**
	 * 用户注册
	 */
	async register(params: IRegisterParams): Promise<IUser> {
		const result = await baseRequest.post('/auth/register', params)
		return result
	}
}

export default new AuthService()
