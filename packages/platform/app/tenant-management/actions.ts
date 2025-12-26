'use server'

import {
	createTenant as createTenantRepo,
	deleteTenant as deleteTenantRepo,
	getTenantList,
	updateTenant as updateTenantRepo,
} from '@/repository/tenant'
import { ITenant } from '@/types'

export async function listTenants() {
	return getTenantList()
}

export async function createTenant(tenant: Omit<ITenant, 'id'>) {
	return createTenantRepo(tenant)
}

export async function updateTenant(tenant: ITenant) {
	return updateTenantRepo(tenant)
}

export async function deleteTenant(id: string) {
	return deleteTenantRepo(id)
}
