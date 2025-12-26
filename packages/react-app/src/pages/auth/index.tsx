import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Tabs } from 'antd'
import { useState } from 'react'

import { Logo } from '@/components'
import { useAuth } from '@/hooks/use-auth'
import { useRedirect2Index } from '@/hooks/use-jump'
import authService from '@/services/auth'

type TabKey = 'login' | 'register'

export default function AuthPage() {
	const [activeTab, setActiveTab] = useState<TabKey>('login')
	const [loading, setLoading] = useState(false)
	const { saveUserInfo } = useAuth()
	const redirect2Index = useRedirect2Index()
	const [form] = Form.useForm()

	const handleLogin = async (values: { email: string; password: string }) => {
		setLoading(true)
		try {
			const user = await authService.login(values)
			saveUserInfo(user)
			message.success('登录成功')
			redirect2Index()
		} catch (error) {
			message.error(error instanceof Error ? error.message : '登录失败')
		} finally {
			setLoading(false)
		}
	}

	const handleRegister = async (values: { email: string; password: string; name?: string }) => {
		setLoading(true)
		try {
			const user = await authService.register(values)
			saveUserInfo(user)
			message.success('注册成功')
			redirect2Index()
		} catch (error) {
			message.error(error instanceof Error ? error.message : '注册失败')
		} finally {
			setLoading(false)
		}
	}

	const onFinish = (values: { email: string; password: string; name?: string }) => {
		if (activeTab === 'login') {
			handleLogin(values)
		} else {
			handleRegister(values)
		}
	}

	return (
		<div className="w-screen h-screen flex flex-col items-center justify-center bg-theme-bg">
			<div className="w-full max-w-md px-8">
				<div className="flex justify-center mb-8">
					<Logo />
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
					<Tabs
						activeKey={activeTab}
						onChange={key => {
							setActiveTab(key as TabKey)
							form.resetFields()
						}}
						centered
						items={[
							{ key: 'login', label: '登录' },
							{ key: 'register', label: '注册' },
						]}
					/>

					<Form
						form={form}
						name="auth"
						onFinish={onFinish}
						autoComplete="off"
						layout="vertical"
						className="mt-4"
					>
						{activeTab === 'register' && (
							<Form.Item name="name">
								<Input
									prefix={<UserOutlined />}
									placeholder="用户名（可选）"
									size="large"
								/>
							</Form.Item>
						)}

						<Form.Item
							name="email"
							rules={[
								{ required: true, message: '请输入邮箱' },
								{ type: 'email', message: '请输入有效的邮箱地址' },
							]}
						>
							<Input
								prefix={<MailOutlined />}
								placeholder="邮箱"
								size="large"
							/>
						</Form.Item>

						<Form.Item
							name="password"
							rules={[
								{ required: true, message: '请输入密码' },
								{ min: 6, message: '密码至少6位' },
							]}
						>
							<Input.Password
								prefix={<LockOutlined />}
								placeholder="密码"
								size="large"
							/>
						</Form.Item>

						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								loading={loading}
								block
								size="large"
							>
								{activeTab === 'login' ? '登录' : '注册'}
							</Button>
						</Form.Item>
					</Form>
				</div>
			</div>
		</div>
	)
}
