'use client'

import { useMount, useRequest } from 'ahooks'
import { Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd'
import Title from 'antd/es/typography/Title'
import { useState } from 'react'

import { ITenant } from '@/types'

import { createTenant, deleteTenant, listTenants, updateTenant } from './actions'

export default function TenantManagementPage() {
	const [modalOpen, setModalOpen] = useState(false)
	const [editingTenant, setEditingTenant] = useState<ITenant | null>(null)
	const [form] = Form.useForm()

	const {
		runAsync: getTenantList,
		data: list,
		loading: listLoading,
	} = useRequest(() => listTenants(), { manual: true })

	useMount(() => {
		getTenantList()
	})

	const handleCreate = () => {
		setEditingTenant(null)
		form.resetFields()
		form.setFieldsValue({ isEnabled: 1 })
		setModalOpen(true)
	}

	const handleEdit = (tenant: ITenant) => {
		setEditingTenant(tenant)
		form.setFieldsValue(tenant)
		setModalOpen(true)
	}

	const handleSubmit = async () => {
		const values = await form.validateFields()
		try {
			if (editingTenant) {
				await updateTenant({ ...editingTenant, ...values })
				message.success('更新租户成功')
			} else {
				await createTenant(values)
				message.success('创建租户成功')
			}
			setModalOpen(false)
			getTenantList()
		} catch (error) {
			message.error(editingTenant ? '更新租户失败' : '创建租户失败')
			console.error(error)
		}
	}

	const handleDelete = async (id: string) => {
		try {
			await deleteTenant(id)
			message.success('删除租户成功')
			getTenantList()
		} catch (error) {
			message.error('删除租户失败')
			console.error(error)
		}
	}

	return (
		<>
			<div className="flex-1 h-full overflow-auto px-6">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center">
						<Title level={3}>租户管理</Title>
					</div>
					<Button
						type="primary"
						onClick={handleCreate}
					>
						新增租户
					</Button>
				</div>
				<Table
					dataSource={list}
					loading={listLoading}
					rowKey="id"
					columns={[
						{
							title: '租户编码',
							dataIndex: 'code',
							key: 'code',
							width: 150,
						},
						{
							title: '租户名称',
							dataIndex: 'name',
							key: 'name',
							width: 200,
						},
						{
							title: '描述',
							dataIndex: 'description',
							key: 'description',
							width: 300,
							ellipsis: true,
							render: text => text || '暂无描述',
						},
						{
							title: '状态',
							dataIndex: 'isEnabled',
							key: 'isEnabled',
							width: 100,
							render: isEnabled =>
								isEnabled === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>,
						},
						{
							title: '访问链接',
							key: 'link',
							width: 300,
							render: (_, record) => {
								const path = `/dify-chat/t/${record.code}/apps`
								return (
									<span
										className="text-blue-500 cursor-pointer hover:underline"
										onClick={() => {
											navigator.clipboard.writeText(path)
											message.success('链接已复制到剪贴板')
										}}
									>
										{path}
									</span>
								)
							},
						},
						{
							title: '操作',
							key: 'action',
							width: 150,
							render: (_, record) => (
								<Space size="middle">
									<Button
										type="link"
										className="!px-0"
										onClick={() => handleEdit(record)}
									>
										编辑
									</Button>
									<Popconfirm
										title="确定删除该租户吗？"
										description="删除后该租户下的应用将变为公共应用"
										onConfirm={() => handleDelete(record.id)}
									>
										<Button
											type="link"
											danger
											className="!px-0"
										>
											删除
										</Button>
									</Popconfirm>
								</Space>
							),
						},
					]}
				/>
			</div>

			<Modal
				title={editingTenant ? '编辑租户' : '新增租户'}
				open={modalOpen}
				onOk={handleSubmit}
				onCancel={() => setModalOpen(false)}
			>
				<Form
					form={form}
					layout="vertical"
					className="mt-4"
				>
					<Form.Item
						name="code"
						label="租户编码"
						rules={[
							{ required: true, message: '请输入租户编码' },
							{ pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和横线' },
						]}
						tooltip="用于 URL 路径，如 company-a"
					>
						<Input
							placeholder="请输入租户编码，如 company-a"
							disabled={!!editingTenant}
						/>
					</Form.Item>
					<Form.Item
						name="name"
						label="租户名称"
						rules={[{ required: true, message: '请输入租户名称' }]}
					>
						<Input placeholder="请输入租户名称" />
					</Form.Item>
					<Form.Item
						name="description"
						label="描述"
					>
						<Input.TextArea
							placeholder="请输入描述"
							rows={3}
						/>
					</Form.Item>
					<Form.Item
						name="isEnabled"
						label="状态"
						rules={[{ required: true, message: '请选择状态' }]}
					>
						<Select
							options={[
								{ label: '启用', value: 1 },
								{ label: '禁用', value: 2 },
							]}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}
