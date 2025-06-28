"use client";
import { useDifyApi } from "@/hooks/useApi";
import { XStream } from "@ant-design/x";
import {
	EventEnum,
	IAgentMessage,
	IChunkChatCompletionResponse,
	IErrorEvent,
	IWorkflowNode,
} from "@dify-chat/api";
import {
	AppInfo,
	AppInputForm,
	LucideIcon,
	MarkdownRenderer,
	WorkflowLogs,
} from "@dify-chat/components";
import { AppModeEnums, useAppContext, useDifyChat } from "@dify-chat/core";
import { copyToClipboard } from "@toolkit-fe/clipboard";
import { Button, Empty, Form, message, Tabs } from "antd";
import { useState } from "react";

/**
 * 工作流应用详情布局
 */
export default function WorkflowLayout({ appMode }: { appMode: AppModeEnums }) {
	const [entryForm] = Form.useForm();
	const { currentApp } = useAppContext();
	const [text, setText] = useState("");
	const [textGenerateStatus, setTextGenerateStatus] = useState<
		"init" | "running" | "finished"
	>("init");
	const [workflowStatus, setWorkflowStatus] = useState<
		"running" | "finished"
	>();
	const [workflowItems, setWorkflowItems] = useState<IWorkflowNode[]>([]);
	const [resultDetail, setResultDetail] = useState<Record<string, string>>({});
	const { user } = useDifyChat();
	const { currentAppId } = useAppContext();
	const difyApi = useDifyApi({
		user,
		appId: currentAppId!,
	});

	const handleTriggerWorkflow = async (values: Record<string, unknown>) => {
		const runner = () => {
			const appMode = currentApp?.config?.info?.mode;
			if (appMode === AppModeEnums.WORKFLOW) {
				return difyApi.runWorkflow({
					inputs: values,
				});
			} else if (appMode === AppModeEnums.TEXT_GENERATOR) {
				return difyApi.completion({
					inputs: values,
				});
			}
			return Promise.reject(`不支持的应用类型: ${appMode}`);
		};

		runner()
			.then(async (res) => {
				const readableStream = XStream({
					readableStream: res.body as NonNullable<ReadableStream>,
				});
				const reader = readableStream.getReader();
				let result = "";
				const workflows: IAgentMessage["workflows"] = {};
				while (reader) {
					const { value: chunk, done } = await reader.read();
					if (done) {
						setWorkflowStatus("finished");
						break;
					}
					if (!chunk) continue;
					if (chunk.data) {
						let parsedData = {} as {
							id: string;
							task_id: string;
							position: number;
							tool: string;
							tool_input: string;
							observation: string;
							message_files: string[];

							event: IChunkChatCompletionResponse["event"] | "text_chunk";
							answer: string;
							conversation_id: string;
							message_id: string;

							// 类型
							type: "image";
							// 图片链接
							url: string;

							data: {
								// 工作流节点的数据
								id: string;
								node_type: IWorkflowNode["type"];
								title: string;
								inputs: string;
								outputs: Record<string, string>;
								process_data: string;
								elapsed_time: number;
								execution_metadata: IWorkflowNode["execution_metadata"];
								text?: string;
							};
						};
						try {
							parsedData = JSON.parse(chunk.data);
						} catch (error) {
							console.error("解析 JSON 失败", error);
						}

						const innerData = parsedData.data;

						if (parsedData.event === "text_chunk") {
							setText((prev) => {
								return prev + parsedData.data.text;
							});
						}

						if (parsedData.event === EventEnum.WORKFLOW_STARTED) {
							workflows.status = "running";
							workflows.nodes = [];
							setWorkflowStatus("running");
							setWorkflowItems([]);
						} else if (parsedData.event === EventEnum.WORKFLOW_FINISHED) {
							workflows.status = "finished";
							const { outputs } = parsedData.data || {};
							const outputsLength = Object.keys(outputs)?.length;
							if (outputsLength > 0) {
								setResultDetail(outputs);
							}
							// 如果返回的对象只有一个属性, 则在 "结果" Tab 中渲染其值
							if (outputsLength === 1) {
								setText(Object.values(outputs)[0] as string);
							}
							setWorkflowStatus("finished");
						} else if (parsedData.event === EventEnum.WORKFLOW_NODE_STARTED) {
							setWorkflowItems((prev) => {
								return [
									...prev,
									{
										id: innerData.id,
										status: "running",
										type: innerData.node_type,
										title: innerData.title,
									} as IWorkflowNode,
								];
							});
						} else if (parsedData.event === EventEnum.WORKFLOW_NODE_FINISHED) {
							setWorkflowItems((prev) => {
								return prev.map((item) => {
									if (item.id === innerData.id) {
										return {
											...item,
											status: "success",
											inputs: innerData.inputs,
											outputs: innerData.outputs,
											process_data: innerData.process_data,
											elapsed_time: innerData.elapsed_time,
											execution_metadata: innerData.execution_metadata,
										};
									}
									return item;
								});
							});
						}
						if (parsedData.event === EventEnum.MESSAGE_FILE) {
							result += `<img src=""${parsedData.url} />`;
						}
						if (parsedData.event === EventEnum.MESSAGE) {
							const text = parsedData.answer;
							if (textGenerateStatus === "init") {
								setTextGenerateStatus("running");
							}
							setText((prev) => {
								return prev + text;
							});
							result += text;
						}
						if (parsedData.event === EventEnum.MESSAGE_END) {
							setText(result);
							setTextGenerateStatus("finished");
						}
						console.log("result", result);
						if (parsedData.event === EventEnum.ERROR) {
							message.error((parsedData as unknown as IErrorEvent).message);
						}
					}
				}
			})
			.catch((err) => {
				console.error("runWorkflow err", err);
				setWorkflowStatus(undefined);
			});
	};

	const resultDetailLength = Object.keys(resultDetail).length;

	const resultItems = [
		{
			key: "result",
			label: "结果",
			children: (
				<div className="w-full h-full overflow-x-hidden overflow-y-auto">
					<MarkdownRenderer markdownText={text} />
				</div>
			),
			visible: resultDetailLength === 1,
		},
		{
			key: "detail",
			label: "详情",
			children: (
				<div className="w-full">
					<LucideIcon
						className="cursor-pointer"
						name="copy"
						onClick={async () => {
							await copyToClipboard(JSON.stringify(resultDetail, null, 2));
							message.success("已复制到剪贴板");
						}}
					/>
					<pre className="w-full overflow-auto bg-theme-code-block-bg p-3 box-border rounded-lg">
						{JSON.stringify(resultDetail, null, 2)}
					</pre>
				</div>
			),
			visible: resultDetailLength > 0,
		},
	].filter((item) => item.visible);

	return (
		<div className="block md:!flex md:items-stretch w-full h-full overflow-y-auto md:overflow-y-hidden bg-gray-50">
			{/* 参数填写区域 */}
			<div className="md:flex-1 overflow-hidden border-0 border-r border-solid border-light-gray bg-theme-bg pb-6 md:pb-0">
				<div className="px-2">
					<AppInfo />
				</div>
				<div className="px-6 mt-6">
					<AppInputForm
						onStartConversation={(values) => {
							console.log("onStartConversation", values);
						}}
						formFilled={false}
						entryForm={entryForm}
						uploadFileApi={difyApi.uploadFile}
					/>
				</div>
				<div className="flex justify-end px-6">
					<Button
						type="primary"
						onClick={async () => {
							await entryForm.validateFields();
							const values = await entryForm.getFieldsValue();
							setResultDetail({});
							setWorkflowItems([]);
							setWorkflowStatus("running");
							setText("");
							handleTriggerWorkflow(values);
						}}
						loading={workflowStatus === "running"}
					>
						运行
					</Button>
				</div>
			</div>

			{/* 工作流执行输出区域 */}
			{appMode === AppModeEnums.WORKFLOW && (
				<div className="md:flex-1 px-4 pt-6 overflow-x-hidden overflow-y-auto bg-gray-50">
					{!workflowItems?.length && workflowStatus !== "running" ? (
						<div className="w-full h-full flex items-center justify-center">
							<Empty
								description={`点击 "运行" 试试看, AI 会给你带来意想不到的惊喜。 `}
							/>
						</div>
					) : (
						<>
							<WorkflowLogs
								className="mt-0"
								status={workflowStatus}
								items={workflowItems}
							/>
							{resultItems?.length ? <Tabs items={resultItems} /> : null}
						</>
					)}
				</div>
			)}

			{/* 文本生成结果渲染 */}
			{appMode === AppModeEnums.TEXT_GENERATOR && (
				<div className="md:flex-1 px-4 pt-6 overflow-x-hidden overflow-y-auto bg-gray-50">
					{textGenerateStatus === "init" ? (
						<div className="w-full h-full flex items-center justify-center">
							<Empty
								description={`点击 "运行" 试试看, AI 会给你带来意想不到的惊喜。 `}
							/>
						</div>
					) : (
						<MarkdownRenderer markdownText={text} />
					)}
				</div>
			)}
		</div>
	);
}
