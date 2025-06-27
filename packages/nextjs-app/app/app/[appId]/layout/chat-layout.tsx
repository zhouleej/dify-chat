"use client";
import {
	EditOutlined,
	MenuOutlined,
	MinusCircleOutlined,
	PlusCircleOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import { IConversationItem } from "@dify-chat/api";
import {
	AppIcon,
	AppInfo,
	ConversationList,
	LucideIcon,
} from "@dify-chat/components";
import { HeaderLayout } from "@/components";
import {
	ConversationsContextProvider,
	IDifyAppItem,
	useAppContext,
} from "@dify-chat/core";
import { isTempId, useIsMobile } from "@dify-chat/helpers";
import {
	ThemeModeEnum,
	ThemeModeLabelEnum,
	useThemeContext,
} from "@dify-chat/theme";
import {
	Button,
	Dropdown,
	Empty,
	Form,
	GetProp,
	Input,
	message,
	Modal,
	Popover,
	Radio,
	Spin,
	Tooltip,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

import ChatboxWrapper from "@/app/app/[appId]/components/chatbox-wrapper";
import { DEFAULT_CONVERSATION_NAME } from "@/config";
import { useLatest } from "@/hooks/use-latest";
import { useSearchParams } from "next/navigation";
import { useDifyApi } from "@/hooks/useApi";
import { getUserAction } from "@/app/actions";
import { useRequest } from "ahooks";

interface IChatLayoutProps {
	/**
	 * 扩展的 JSX 元素, 如抽屉/弹窗等
	 */
	extComponents?: React.ReactNode;
	/**
	 * 自定义中心标题
	 */
	renderCenterTitle?: (appInfo?: IDifyAppItem["info"]) => React.ReactNode;
	/**
	 * 自定义右侧头部内容
	 */
	renderRightHeader?: () => React.ReactNode;
	/**
	 * 是否正在加载应用配置
	 */
	initLoading: boolean;
}

export default function ChatLayout(props: IChatLayoutProps) {
	const { extComponents, renderCenterTitle, initLoading } = props;
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const { themeMode, setThemeMode } = useThemeContext();
	const { appLoading, currentApp } = useAppContext();
	const [renameForm] = Form.useForm();
	const [conversations, setConversations] = useState<IConversationItem[]>([]);
	const [currentConversationId, setCurrentConversationId] =
		useState<string>("");
	const currentConversationInfo = useMemo(() => {
		return conversations.find((item) => item.id === currentConversationId);
	}, [conversations, currentConversationId]);
	const isMobile = useIsMobile();
	const { currentAppId } = useAppContext();
	const { data: userInfo } = useRequest(() => {
		return getUserAction();
	});
	const difyApi = useDifyApi({
		user: userInfo?.userId as string,
		appId: currentAppId!,
	});

	const searchParams = useSearchParams();

	// 创建 Dify API 实例
	const [conversationListLoading, setCoversationListLoading] =
		useState<boolean>(false);
	const latestCurrentConversationId = useLatest(currentConversationId);

	useEffect(() => {
		if (!currentApp?.config) {
			return;
		}
		setConversations([]);
		setCurrentConversationId("");
		getConversationItems().then(() => {
			const isNewConversation = searchParams.get("isNewCvst") === "1";
			if (isNewConversation) {
				onAddConversation();
			}
		});
	}, [currentApp?.config]);

	/**
	 * 获取对话列表
	 */
	const getConversationItems = async (showLoading = true) => {
		if (showLoading) {
			setCoversationListLoading(true);
		}
		try {
			const result = await difyApi?.getConversationList({
				limit: 100,
			});
			const newItems =
				result?.data?.map((item) => {
					return {
						key: item.id,
						label: item.name,
					};
				}) || [];
			setConversations(result?.data);
			// 避免闭包问题
			if (!latestCurrentConversationId.current) {
				if (newItems.length) {
					setCurrentConversationId(newItems[0]?.key);
				} else {
					onAddConversation();
				}
			}
		} catch (error) {
			console.error(error);
			message.error(`获取会话列表失败: ${error}`);
		} finally {
			setCoversationListLoading(false);
		}
	};

	/**
	 * 添加临时新对话(要到第一次服务器响应有效的对话 ID 时才真正地创建完成)
	 */
	const onAddConversation = () => {
		// 创建新对话
		const newKey = `temp_${Math.random()}`;
		// 使用函数式更新保证状态一致性（修复潜在竞态条件）
		setConversations((prev) => {
			return [
				{
					id: newKey,
					name: DEFAULT_CONVERSATION_NAME,
					created_at: dayjs().valueOf(),
					inputs: {},
					introduction: "",
					status: "normal",
					updated_at: dayjs().valueOf(),
				},
				...(prev || []),
			];
		});
		setCurrentConversationId(newKey);
	};

	/**
	 * 重命名对话
	 */
	const onRenameConversation = async (conversationId: string, name: string) => {
		await difyApi?.renameConversation({
			conversation_id: conversationId,
			name,
		});
		getConversationItems();
	};

	/**
	 * 重命名会话
	 * @param conversation 会话对象
	 */
	const handleRenameConversation = () => {
		renameForm.setFieldsValue({
			name: currentConversationInfo?.name,
		});
		Modal.confirm({
			centered: true,
			destroyOnClose: true,
			title: "编辑对话名称",
			content: (
				<Form form={renameForm} className="mt-3">
					<Form.Item name="name">
						<Input placeholder="请输入" />
					</Form.Item>
				</Form>
			),
			onOk: async () => {
				await renameForm.validateFields();
				const values = await renameForm.validateFields();
				await onRenameConversation(currentConversationId, values.name);
				message.success("对话重命名成功");
			},
		});
	};

	/**
	 * 删除对话
	 */
	const onDeleteConversation = async (conversationId: string) => {
		if (isTempId(conversationId)) {
			setConversations((prev) => {
				const newConversations = prev.filter(
					(item) => item.id !== conversationId,
				);
				// 删除当前对话
				if (conversationId === currentConversationId) {
					// 如果列表不为空，则选择第一个作为当前对话
					if (newConversations.length) {
						setCurrentConversationId(newConversations[0].id);
					} else {
						// 如果列表为空，则创建一个新的临时对话
						onAddConversation();
					}
				}
				return newConversations;
			});
		} else {
			await difyApi?.deleteConversation(conversationId);
			if (conversationId === currentConversationId) {
				setCurrentConversationId("");
			}
			getConversationItems();
			return Promise.resolve();
		}
	};

	const mobileMenuItems: GetProp<typeof Dropdown, "menu">["items"] =
		useMemo(() => {
			const actionMenus: GetProp<typeof Dropdown, "menu">["items"] = [
				{
					key: "add_conversation",
					icon: <PlusCircleOutlined />,
					label: "新增对话",
					disabled: isTempId(currentConversationId),
					onClick: () => {
						onAddConversation();
					},
				},
				{
					key: "rename_conversation",
					icon: <EditOutlined />,
					label: "编辑对话名称",
					disabled: isTempId(currentConversationId),
					onClick: () => {
						handleRenameConversation();
					},
				},
				{
					key: "delete_conversation",
					icon: <MinusCircleOutlined />,
					label: "删除当前对话",
					disabled: isTempId(currentConversationId),
					danger: true,
					onClick: () => {
						Modal.confirm({
							centered: true,
							title: "确定删除当前对话？",
							content: "删除后，聊天记录将不可恢复。",
							okText: "删除",
							cancelText: "取消",
							onOk: async () => {
								// 执行删除操作
								await onDeleteConversation(currentConversationId);
								message.success("删除成功");
							},
						});
					},
				},
				{
					type: "divider",
				},
			];

			const conversationListMenus: GetProp<typeof Dropdown, "menu">["items"] = [
				{
					key: "view-mode",
					type: "group",
					children: [
						{
							key: "light",
							label: (
								<Radio.Group
									key="view-mode"
									optionType="button"
									value={themeMode}
									onChange={(e) => {
										setThemeMode(e.target.value as ThemeModeEnum);
									}}
								>
									<Radio value={ThemeModeEnum.SYSTEM}>
										{ThemeModeLabelEnum.SYSTEM}
									</Radio>
									<Radio value={ThemeModeEnum.LIGHT}>
										{ThemeModeLabelEnum.LIGHT}
									</Radio>
									<Radio value={ThemeModeEnum.DARK}>
										{ThemeModeLabelEnum.DARK}
									</Radio>
								</Radio.Group>
							),
						},
					],
					label: "主题",
				},
				{
					type: "divider",
				},
				{
					type: "group",
					label: "对话列表",
					children: conversations?.length
						? conversations.map((item) => {
								return {
									key: item.id,
									label: item.name,
									onClick: () => {
										setCurrentConversationId(item.id);
									},
								};
							})
						: [
								{
									key: "no_conversation",
									label: "暂无对话",
									disabled: true,
								},
							],
				},
			];

			if (isTempId(currentConversationId)) {
				return [...conversationListMenus];
			}

			return [...actionMenus, ...conversationListMenus];
		}, [currentConversationId, conversations, themeMode, setThemeMode]);

	// 对话列表（包括加载和缺省状态）
	const conversationListWithEmpty = useMemo(() => {
		return (
			<Spin spinning={conversationListLoading}>
				{conversations?.length ? (
					<ConversationList
						renameConversationPromise={onRenameConversation}
						deleteConversationPromise={onDeleteConversation}
						items={conversations.map((item) => {
							return {
								key: item.id,
								label: item.name,
							};
						})}
						activeKey={currentConversationId}
						onActiveChange={(id) => {
							setCurrentConversationId(id);
						}}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Empty className="pt-6" description="暂无会话" />
					</div>
				)}
			</Spin>
		);
	}, [
		conversations,
		onRenameConversation,
		onDeleteConversation,
		setCurrentConversationId,
	]);

	return (
		<ConversationsContextProvider
			value={{
				conversations,
				setConversations,
				currentConversationId,
				setCurrentConversationId,
				currentConversationInfo,
			}}
		>
			<div
				className={`w-full h-screen flex flex-col overflow-hidden bg-theme-bg`}
			>
				{/* 头部 */}
				<HeaderLayout
					title={renderCenterTitle?.(currentApp?.config?.info)}
					rightIcon={
						isMobile ? (
							<Dropdown
								menu={{
									className: "!pb-3 w-[80vw]",
									activeKey: currentConversationId,
									items: mobileMenuItems,
								}}
							>
								<MenuOutlined className="text-xl" />
							</Dropdown>
						) : null
					}
				/>

				{/* Main */}
				<div className="flex-1 overflow-hidden flex rounded-t-3xl bg-theme-main-bg">
					{appLoading || initLoading ? (
						<div className="absolute w-full h-full left-0 top-0 z-50 flex items-center justify-center">
							<Spin spinning />
						</div>
					) : currentApp?.config ? (
						<>
							{/* 左侧对话列表 */}
							<div
								className={`hidden md:!flex ${sidebarOpen ? "w-72" : "w-14"} transition-all h-full flex-col border-r border-solid border-r-(--theme-splitter-color)`}
							>
								{sidebarOpen ? (
									<>
										{currentApp.config.info ? <AppInfo /> : null}
										{/* 添加会话 */}
										{currentApp ? (
											<Button
												onClick={() => {
													onAddConversation();
												}}
												type="default"
												className="h-10 leading-10 rounded-lg border border-solid border-gray-200 mt-3 mx-4 text-theme-text "
												icon={<PlusOutlined className="" />}
											>
												新增对话
											</Button>
										) : null}
										{/* 🌟 对话管理 */}
										<div className="px-4 mt-3 flex-1 overflow-auto">
											{conversationListWithEmpty}
										</div>
									</>
								) : (
									<div className="flex flex-col justify-start items-center flex-1 pt-6">
										{/* 应用图标 */}
										<div className="mb-1.5 flex items-center justify-center">
											<AppIcon size="small" />
										</div>

										{/* 新增对话 */}
										<Tooltip title="新增对话" placement="right">
											<div className="text-theme-text my-1.5 hover:text-primary flex items-center">
												<LucideIcon
													name="plus-circle"
													strokeWidth={1.25}
													size={28}
													className="cursor-pointer"
													onClick={() => {
														onAddConversation();
													}}
												/>
											</div>
										</Tooltip>

										<Popover
											content={
												<div className="max-h-[50vh] overflow-auto pr-3">
													{conversationListWithEmpty}
												</div>
											}
											title="对话列表"
											placement="rightTop"
										>
											{/* 必须包裹一个 HTML 标签才能正常展示 Popover */}
											<div className="flex items-center justify-center">
												<LucideIcon
													className="my-1.5 cursor-pointer hover:text-primary"
													strokeWidth={1.25}
													size={28}
													name="menu"
												/>
											</div>
										</Popover>
									</div>
								)}

								<div className="border-t border-solid border-(--theme-splitter-color) flex items-center justify-center h-12">
									<Tooltip
										title={sidebarOpen ? "折叠侧边栏" : "展开侧边栏"}
										placement="right"
									>
										<div className="flex items-center justify-center">
											<LucideIcon
												onClick={() => {
													setSidebarOpen(!sidebarOpen);
												}}
												name={
													sidebarOpen
														? "arrow-left-circle"
														: "arrow-right-circle"
												}
												className="cursor-pointer hover:text-primary"
												strokeWidth={1.25}
												size={28}
											/>
										</div>
									</Tooltip>
								</div>
							</div>

							{/* 右侧聊天窗口 - 移动端全屏 */}
							<div className="flex-1 min-w-0 flex flex-col overflow-hidden">
								<ChatboxWrapper
									conversationListLoading={conversationListLoading}
									onAddConversation={onAddConversation}
									conversationItemsChangeCallback={() =>
										getConversationItems(false)
									}
								/>
							</div>
						</>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Empty
								description="暂无 Dify 应用配置，请联系管理员"
								className="text-base"
							/>
						</div>
					)}
				</div>
			</div>

			{extComponents}
		</ConversationsContextProvider>
	);
}
