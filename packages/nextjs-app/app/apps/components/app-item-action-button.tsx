"use client";
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { IDifyAppItem } from "@dify-chat/core";

import { Dropdown, message } from "antd";
import { useAppEditDrawer } from "@/app/apps/hooks/use-app-edit-drawer";
import { AppDetailDrawerModeEnum } from "@/app/apps/enums";
import { deleteApp } from "@/app/apps/actions";

export default function AppItemActionButton(props: {
	item: IDifyAppItem;
	refreshAppList: () => Promise<void>;
}) {
	const { item, refreshAppList } = props;
	const {
		setAppEditDrawerMode,
		setAppEditDrawerOpen,
		setAppEditDrawerAppItem,
		drawerComponent,
	} = useAppEditDrawer({
		successCallback: () => refreshAppList(),
	});
	return (
		<>
			<Dropdown
				menu={{
					items: [
						{
							key: "edit",
							icon: <EditOutlined />,
							label: "编辑",
							onClick: () => {
								setAppEditDrawerMode(AppDetailDrawerModeEnum.edit);
								setAppEditDrawerOpen(true);
								setAppEditDrawerAppItem(item);
							},
						},
						{
							key: "delete",
							icon: <DeleteOutlined />,
							label: "删除",
							danger: true,
							onClick: async () => {
								await deleteApp(item.id);
								message.success("删除应用成功");
								// 重新加载列表页
								refreshAppList();
							},
						},
					],
				}}
			>
				<MoreOutlined className="absolute right-3 top-3 text-lg" />
			</Dropdown>
			{drawerComponent}
		</>
	);
}
