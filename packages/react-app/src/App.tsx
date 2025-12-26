import { initResponsiveConfig } from '@dify-chat/helpers'
import { useThemeContext } from '@dify-chat/theme'
import { theme as antdTheme, ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { BrowserRouter, type IRoute } from 'pure-react-router'

import './App.css'
import LayoutIndex from './layout'
import AppListPage from './pages/apps'
import AuthPage from './pages/auth'
import ChatPage from './pages/chat'
import TenantAppListPage from './pages/tenant-apps'
import TenantChatPage from './pages/tenant-chat'

// 初始化响应式配置
initResponsiveConfig()

const routes: IRoute[] = [
	{ path: '/auth', component: () => <AuthPage /> },
	{ path: '/chat', component: () => <ChatPage /> },
	{ path: '/app/:appId', component: () => <ChatPage /> },
	{ path: '/apps', component: () => <AppListPage /> },
	// 租户模式路由
	{ path: '/t/:tenantCode/apps', component: () => <TenantAppListPage /> },
	{ path: '/t/:tenantCode/app/:appId', component: () => <TenantChatPage /> },
]

/**
 * Dify Chat 的最小应用实例
 */
export default function App() {
	const { isDark } = useThemeContext()

	return (
		<ConfigProvider
			locale={zhCN}
			theme={{
				algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			}}
		>
			<BrowserRouter
				basename="/dify-chat"
				routes={routes}
			>
				<LayoutIndex />
			</BrowserRouter>
		</ConfigProvider>
	)
}
