'use client'

import { Spin } from 'antd'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface AuthGuardProps {
	children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (status === 'loading') return // 仍在加载中

		if (!session) {
			router.push('/login')
		}
	}, [session, status, router])

	// 避免 hydration 不匹配，等待客户端挂载
	if (!mounted) {
		return null
	}

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spin size="large" />
			</div>
		)
	}

	if (!session) {
		return null
	}

	return <>{children}</>
}
