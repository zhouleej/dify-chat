'use server'

import { appItemToDbApp, appItemToDbAppUpdate, dbAppToAppItem } from '@/lib/db/types'
import { prisma } from '@/lib/prisma'
import { IDifyAppItem } from '@/types'

/**
 * 获取应用列表数据
 */
export const getAppList = async (): Promise<IDifyAppItem[]> => {
	try {
		const dbApps = await prisma.difyApp.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		})
		return dbApps.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching app list:', error)
		throw new Error('Failed to fetch app list')
	}
}

/**
 * 根据用户ID获取应用列表
 */
export const getAppListByUserId = async (userId: string): Promise<IDifyAppItem[]> => {
	try {
		const dbApps = await prisma.difyApp.findMany({
			where: {
				userId: userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
		return dbApps.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching app list by user:', error)
		throw new Error('Failed to fetch app list')
	}
}

/**
 * 根据租户Code获取应用列表
 */
export const getAppListByTenantCode = async (tenantCode: string): Promise<IDifyAppItem[]> => {
	try {
		// 先根据 code 查找租户
		const tenant = await prisma.tenant.findUnique({
			where: { code: tenantCode },
		})
		if (!tenant) {
			return []
		}
		const dbApps = await prisma.difyApp.findMany({
			where: {
				tenantId: tenant.id,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
		return dbApps.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching app list by tenant:', error)
		throw new Error('Failed to fetch app list')
	}
}

/**
 * 获取公共应用列表（没有 userId 和 tenantId 的应用）
 */
export const getPublicAppList = async (): Promise<IDifyAppItem[]> => {
	try {
		const dbApps = await prisma.difyApp.findMany({
			where: {
				userId: null,
				tenantId: null,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
		return dbApps.map(dbAppToAppItem)
	} catch (error) {
		console.error('Error fetching public app list:', error)
		throw new Error('Failed to fetch app list')
	}
}

/**
 * 根据 ID 获取应用详情
 */
export const getAppItem = async (id: string): Promise<IDifyAppItem | null> => {
	try {
		const dbApp = await prisma.difyApp.findUnique({
			where: { id },
		})
		return dbApp ? dbAppToAppItem(dbApp) : null
	} catch (error) {
		console.error('Error fetching app item:', error)
		throw new Error('Failed to fetch app item')
	}
}

/**
 * 新增应用配置
 */
export const addApp = async (app: Omit<IDifyAppItem, 'id'>): Promise<IDifyAppItem> => {
	try {
		const dbAppData = appItemToDbApp(app)
		const dbApp = await prisma.difyApp.create({
			data: dbAppData,
		})
		return dbAppToAppItem(dbApp)
	} catch (error) {
		console.error('Error adding app:', error)
		throw new Error('Failed to add app')
	}
}

/**
 * 更新应用
 */
export const updateApp = async (app: IDifyAppItem): Promise<IDifyAppItem> => {
	try {
		const dbAppData = appItemToDbAppUpdate(app)
		const { id, ...updateData } = dbAppData
		const dbApp = await prisma.difyApp.update({
			where: { id },
			data: updateData,
		})
		return dbAppToAppItem(dbApp)
	} catch (error) {
		console.error('Error updating app:', error)
		throw new Error('Failed to update app')
	}
}

/**
 * 删除应用
 */
export const deleteApp = async (id: string): Promise<void> => {
	try {
		await prisma.difyApp.delete({
			where: { id },
		})
	} catch (error) {
		console.error('Error deleting app:', error)
		throw new Error('Failed to delete app')
	}
}
