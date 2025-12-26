'use server'

import { ITenant } from '@/types'

import * as prismaRepo from './prisma/tenant'

export const getTenantList = async (): Promise<ITenant[]> => {
	return prismaRepo.getTenantList()
}

export const getTenantByCode = async (code: string): Promise<ITenant | null> => {
	return prismaRepo.getTenantByCode(code)
}

export const getTenantById = async (id: string): Promise<ITenant | null> => {
	return prismaRepo.getTenantById(id)
}

export const createTenant = async (tenant: Omit<ITenant, 'id'>): Promise<ITenant> => {
	return prismaRepo.createTenant(tenant)
}

export const updateTenant = async (tenant: ITenant): Promise<ITenant> => {
	return prismaRepo.updateTenant(tenant)
}

export const deleteTenant = async (id: string): Promise<void> => {
	return prismaRepo.deleteTenant(id)
}
