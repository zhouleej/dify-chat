import Image from 'next/image'
import { ReactNode } from 'react'

import LogoIcon from '@/assets/images/logo.png'

import AdminHeaderTitle from './admin-header-title'
import PageLayout from './page-layout'

interface IAdminPageLayoutProps {
	children: ReactNode
}

/**
 * 控制台的页面布局组件
 */
export default function AdminPageLayout(props: IAdminPageLayoutProps) {
	const { children } = props

	return (
		<PageLayout
			headerProps={{
				logoText: '吉安移动多智能体平台',
				renderLogo: () => (
					<Image
						src={LogoIcon}
						width={32}
						height={32}
						alt="吉安移动多智能体平台"
					/>
				),
				isTitleWrapped: true,
				title: <AdminHeaderTitle />,
			}}
		>
			{children}
		</PageLayout>
	)
}
