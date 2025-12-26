'use server'

import { prisma } from '@/lib/prisma'
import { ITenant } from '@/types'

/**
 * 获取租户列表
 */
export const getTenantList = async (): Promise<ITenant[]> => {
	try {
		const tenants = await prisma.tenant.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		})
		return tenants.map(t => ({
			id: t.id,
			code: t.code,
			name: t.name,
			description: t.description || undefined,
			isEnabled: t.isEnabled as 1 | 2,
		}))
	} catch (error) {
		console.error('Error fetching tenant list:', error)
		throw new Error('Failed to fetch tenant list')
	}
}

/**
 * 根据 code 获取租户
 */
export const getTenantByCode = async (code: string): Promise<ITenant | null> => {
	try {
		const tenant = await prisma.tenant.findUnique({
			where: { code },
		})
		if (!tenant) return null
		return {
			id: tenant.id,
			code: tenant.code,
			name: tenant.name,
			description: tenant.description || undefined,
			isEnabled: tenant.isEnabled as 1 | 2,
		}
	} catch (error) {
		console.error('Error fetching tenant by code:', error)
		throw new Error('Failed to fetch tenant')
	}
}

/**
 * 根据 ID 获取租户
 */
export const getTenantById = async (id: string): Promise<ITenant | null> => {
	try {
		const tenant = await prisma.tenant.findUnique({
			where: { id },
		})
		if (!tenant) return null
		return {
			id: tenant.id,
			code: tenant.code,
			name: tenant.name,
			description: tenant.description || undefined,
			isEnabled: tenant.isEnabled as 1 | 2,
		}
	} catch (error) {
		console.error('Error fetching tenant by id:', error)
		throw new Error('Failed to fetch tenant')
	}
}

/**
 * 创建租户
 */
export const createTenant = async (tenant: Omit<ITenant, 'id'>): Promise<ITenant> => {
	try {
		const created = await prisma.tenant.create({
			data: {
				code: tenant.code,
				name: tenant.name,
				description: tenant.description || null,
				isEnabled: tenant.isEnabled,
			},
		})
		return {
			id: created.id,
			code: created.code,
			name: created.name,
			description: created.description || undefined,
			isEnabled: created.isEnabled as 1 | 2,
		}
	} catch (error) {
		console.error('Error creating tenant:', error)
		throw new Error('Failed to create tenant')
	}
}

/**
 * 更新租户
 */
export const updateTenant = async (tenant: ITenant): Promise<ITenant> => {
	try {
		const updated = await prisma.tenant.update({
			where: { id: tenant.id },
			data: {
				code: tenant.code,
				name: tenant.name,
				description: tenant.description || null,
				isEnabled: tenant.isEnabled,
			},
		})
		return {
			id: updated.id,
			code: updated.code,
			name: updated.name,
			description: updated.description || undefined,
			isEnabled: updated.isEnabled as 1 | 2,
		}
	} catch (error) {
		console.error('Error updating tenant:', error)
		throw new Error('Failed to update tenant')
	}
}

/**
 * 删除租户
 */
export const deleteTenant = async (id: string): Promise<void> => {
	try {
		await prisma.tenant.delete({
			where: { id },
		})
	} catch (error) {
		console.error('Error deleting tenant:', error)
		throw new Error('Failed to delete tenant')
	}
}
