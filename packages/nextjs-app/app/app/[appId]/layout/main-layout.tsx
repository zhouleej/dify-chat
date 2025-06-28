import { XProvider } from "@ant-design/x";
import { AppModeEnums, IDifyAppItem, useAppContext } from "@dify-chat/core";
import React from "react";

import { colors } from "@/config/theme";

import ChatLayout from "@/app/app/[appId]/layout/chat-layout";
import CommonLayout from "@/app/app/[appId]/layout/common-layout";
import WorkflowLayout from "@/app/app/[appId]/layout/workflow-layout";

interface IMainLayoutProps {
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

/**
 * 应用详情主界面布局
 */
const MainLayout = (props: IMainLayoutProps) => {
	const { currentApp } = useAppContext();

	// FIXME: 去掉这里的默认值
	const appMode = currentApp?.config?.info?.mode || AppModeEnums.CHATBOT;

	return (
		<XProvider
			theme={{
				token: {
					colorPrimary: colors.primary,
					colorText: colors["theme-text"],
				},
			}}
		>
			{[
				AppModeEnums.CHATBOT,
				AppModeEnums.CHATFLOW,
				AppModeEnums.AGENT,
			].includes(appMode) ? (
				<ChatLayout {...props} />
			) : (
				<CommonLayout
					initLoading={props.initLoading}
					renderCenterTitle={props.renderCenterTitle}
					extComponents={props.extComponents}
				>
					{[AppModeEnums.WORKFLOW, AppModeEnums.TEXT_GENERATOR].includes(
						appMode,
					) ? (
						<WorkflowLayout appMode={appMode} />
					) : (
						<div>不支持的应用类型</div>
					)}
				</CommonLayout>
			)}
		</XProvider>
	);
};

export default MainLayout;
