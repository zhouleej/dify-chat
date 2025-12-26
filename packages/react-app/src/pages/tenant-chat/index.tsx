import { useParams } from 'pure-react-router'

import MultiAppLayout from '@/layout/chat-layout-wrapper'

/**
 * 租户模式的聊天页面
 * 无需登录，通过 URL 中的 tenantCode 获取应用
 */
export default function TenantChatPage() {
	const { tenantCode } = useParams<{ tenantCode: string }>()

	return <MultiAppLayout tenantCode={tenantCode} />
}
