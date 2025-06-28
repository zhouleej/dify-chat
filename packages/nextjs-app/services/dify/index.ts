import { IDifyAppItem, IDifyAppSiteSetting } from "@dify-chat/core";

import { BaseRequest as XRequest } from "@dify-chat/helpers";
import { IAgentThought, IRetrieverResource } from "@dify-chat/api";
import { IFileType } from "@dify-chat/core";

/**
 * 用户输入表单控件类型
 */
export type IUserInputFormItemType =
	| "text-input"
	| "paragraph"
	| "select"
	| "number"
	| "file"
	| "file-list";

/**
 * 用户输入表单控件对象
 */
export interface IUserInputFormItemValueBase {
	default: string;
	label: string;
	required: boolean;
	variable: string;
	options?: string[];
	/**
	 * 最大长度
	 */
	max_length?: number;
	type: IUserInputFormItemType;
	allowed_file_types?: IFileType[];
}

/**
 * 应用输入配置
 */
export type IUserInputForm = Record<
	IUserInputFormItemType,
	IUserInputFormItemValueBase
>;

/**
 * 获取应用参数-响应体
 */
export interface IGetAppParametersResponse {
	/**
	 * 开场白
	 */
	opening_statement?: string;
	/**
	 * 用户输入表单
	 */
	user_input_form: IUserInputForm[];
	/**
	 * 开场建议问题
	 */
	suggested_questions?: string[];
	/**
	 * 下一轮问题建议
	 */
	suggested_questions_after_answer: {
		/**
		 * 是否启用
		 */
		enabled: boolean;
	};
	/**
	 * 文件上传参数
	 */
	file_upload: {
		/**
		 * 是否允许上传文件
		 */
		enabled: boolean;
		/**
		 * 允许上传的文件后缀名
		 */
		allowed_file_extensions: string[];
		/**
		 * 允许上传的文件类型
		 */
		allowed_file_types: IFileType[];
		/**
		 * 允许的上传方式 - remote_url-远程地址 local_file-本地文件
		 */
		allowed_file_upload_methods: Array<"remote_url" | "local_file">;
		/**
		 * 文件上传配置
		 */
		fileUploadConfig: {
			/**
			 * 文件大小限制（单位：MB）
			 */
			file_size_limit: number;
			/**
			 * 批量上传文件数量限制
			 */
			batch_count_limit: number;
			/**
			 * 图片文件大小限制（单位：MB）
			 */
			image_file_size_limit: number;
			/**
			 * 视频文件大小限制（单位：MB）
			 */
			video_file_size_limit: number;
			/**
			 * 音频文件大小限制（单位：MB）
			 */
			audio_file_size_limit: number;
			/**
			 * 工作流文件上传限制（单位：MB）
			 */
			workflow_file_upload_limit: number;
		};
		/**
		 * 图片上传配置
		 */
		image: {
			/**
			 * 是否启用图片上传
			 */
			enabled: false;
			/**
			 * 允许上传的图片最大数量
			 */
			number_limits: 3;
			/**
			 * 允许的上传方式 - remote_url-远程地址 local_file-本地文件
			 */
			transfer_methods: ["local_file", "remote_url"];
		};
		/**
		 * 允许上传的文件数量
		 */
		number_limits: number;
	};
	/**
	 * 文本转语音配置
	 */
	text_to_speech: {
		/**
		 * 是否启用
		 */
		enabled: boolean;
		/**
		 * 是否开启自动播放 enabled-启用 disabled-禁用
		 */
		autoPlay: "enabled" | "disabled";
		/**
		 * 语言
		 */
		language: string;
		/**
		 * 音色
		 */
		voice: string;
	};
	/**
	 * 语音转文本配置
	 */
	speech_to_text: {
		/**
		 * 是否启用
		 */
		enabled: boolean;
	};
}

export interface IConversationItem {
	created_at: number;
	id: string;
	inputs: Record<string, unknown>;
	introduction: string;
	name: string;
	status: "normal";
	updated_at: number;
}

/**
 * 获取工作流执行结果-响应体
 */
export interface IGetWorkflowResultResponse {
	/** workflow 执行 ID */
	id: string;
	/** 关联的 Workflow ID */
	workflow_id: string;
	/** 执行状态 running / succeeded / failed / stopped */
	status: string;
	/** 任务输入内容 */
	inputs: object;
	/** 任务输出内容 */
	outputs: object;
	/** 错误原因 */
	error: string;
	/** 任务执行总步数 */
	total_steps: number;
	/** 任务执行总 tokens */
	total_tokens: number;
	/** 任务开始时间 */
	created_at: number;
	/** 任务结束时间 */
	finished_at: number;
	/** 耗时(s) */
	elapsed_time: number;
}

/**
 * 获取会话列表-参数
 */
interface IGetConversationListRequest {
	/**
	 * 返回条数
	 */
	limit: number;
}

/**
 * 获取会话列表-响应体
 */
interface IGetConversationListResponse {
	data: IConversationItem[];
}

/**
 * 消息文件所属类型
 */
export enum MessageFileBelongsToEnum {
	"user" = "user", // 用户
	"assistant" = "assistant", // 助手
}

/**
 * 消息文件 Item 结构
 */
interface IMessageFileItem {
	id: string;
	filename: string;
	type: string;
	url: string;
	mime_type: string;
	size: number;
	transfer_method: string;
	belongs_to: MessageFileBelongsToEnum;
	upload_file_id: string;
}

/**
 * 会话历史 Item 结构
 */
interface IMessageItem {
	/**
	 * 消息 ID
	 */
	id: string;
	/**
	 * 对话 ID
	 */
	conversation_id: string;
	/**
	 * 输入参数，键值对形式
	 */
	inputs: Record<string, string>;
	/**
	 * 问题
	 */
	query: string;
	/**
	 * 答案
	 */
	answer: string;
	/**
	 * 消息关联的文件列表
	 */
	message_files?: IMessageFileItem[];
	/**
	 * 消息反馈信息
	 */
	feedback?: {
		/**
		 * 反馈类型，like 表示点赞，dislike 表示点踩
		 */
		rating: "like" | "dislike";
	};
	/**
	 * 消息状态，normal 表示正常，error 表示出错
	 */
	status: "normal" | "error";
	/**
	 * 错误信息，若消息状态为 error 时，该字段包含具体错误信息，否则为 null
	 */
	error: string | null;
	/**
	 * 智能体思考过程列表
	 */
	agent_thoughts?: IAgentThought[];
	/**
	 * 消息创建时间戳
	 */
	created_at: number;
	/**
	 * 知识库引用列表
	 */
	retriever_resources?: IRetrieverResource[];
}

interface IGetConversationHistoryResponse {
	data: IMessageItem[];
}

export interface IDifyApiOptions {
	/**
	 * 用户
	 */
	user: string;
	/**
	 * 应用 ID
	 */
	appId: string;
}

export type IGetAppInfoResponse = IDifyAppItem["info"];

export interface IGetAppMetaResponse {
	tool_icons: {
		dalle2: string;
		api_tool: {
			background: string;
			content: string;
		};
	};
}

export interface IFileBase {
	/**
	 * 文件类型
	 */
	type: IFileType;
}

export interface IFileRemote extends IFileBase {
	/**
	 * 传递方式 remote_url-远程地址 local_file-本地文件
	 */
	transfer_method: "remote_url";
	/**
	 * 图片地址（仅当传递方式为 remote_url 时）
	 */
	url?: string;
}

export interface IFileLocal extends IFileBase {
	/**
	 * 传递方式 remote_url-远程地址 local_file-本地文件
	 */
	transfer_method: "local_file";
	/**
	 * 上传文件 ID（仅当传递方式为 local_file 时）
	 */
	upload_file_id?: string;
}

export type IFile = IFileRemote | IFileLocal;

/**
 * 上传文件接口详情
 */
export interface IUploadFileResponse {
	id: string;
	name: string;
	size: number;
	extension: string;
	mime_type: string;
	created_by: number;
	created_at: number;
}

/**
 * 语音转文字的响应
 */
export interface IAudio2TextResponse {
	/**
	 * 生成的文本内容
	 */
	text: string;
}

/**
 * Dify API 类
 */
export class DifyApi {
	constructor(options: IDifyApiOptions) {
		this.options = options;
		this.baseRequest = new XRequest({
			baseURL: "/api/external/dify",
		});
	}

	options: IDifyApiOptions;
	baseRequest: XRequest;

	/**
	 * 获取应用基本信息
	 */
	getAppInfo = async () => {
		return this.baseRequest
			.get(`/${this.options.appId}/info`)
			.then((res) => res.data) as Promise<IGetAppInfoResponse>;
	};

	/**
	 * 获取应用 Meta 信息
	 */
	getAppMeta = async () => {
		return this.baseRequest
			.get(`${this.options.appId}/meta`)
			.then((res) => res.data) as Promise<IGetAppMetaResponse>;
	};

	/**
	 * 获取应用参数
	 */
	getAppParameters = () => {
		return this.baseRequest
			.get(`/${this.options.appId}/parameters`)
			.then((res) => res.data) as Promise<IGetAppParametersResponse>;
	};

	/**
	 * 获取应用 WebAPP 设置
	 * @Limited Dify v1.4.0 版本开始支持
	 */
	getAppSiteSetting = () => {
		return this.baseRequest
			.get(`/${this.options.appId}/site`)
			.then((res) => res.data) as Promise<IDifyAppSiteSetting>;
	};

	/**
	 * 获取当前用户的会话列表（默认返回最近20条）
	 */
	getConversationList = (params?: IGetConversationListRequest) => {
		return this.baseRequest
			.get(`/${this.options.appId}/conversations`, {
				limit: (params?.limit || 100).toString(),
			})
			.then((res) => res.data) as Promise<IGetConversationListResponse>;
	};

	/**
	 * 会话重命名
	 */
	renameConversation = (params: {
		/**
		 * 会话 ID
		 */
		conversation_id: string;
		/**
		 * 名称，若 auto_generate 为 true 时，该参数可不传。
		 */
		name?: string;
		/**
		 * 自动生成标题，默认 false
		 */
		auto_generate?: boolean;
	}) => {
		const { conversation_id, ...restParams } = params;
		return this.baseRequest.put(
			`/${this.options.appId}/conversation/${conversation_id}/name`,
			{
				...restParams,
			},
		);
	};

	/**
	 * 删除会话
	 */
	deleteConversation = (conversation_id: string) => {
		return this.baseRequest.delete(
			`/${this.options.appId}/conversation/${conversation_id}`,
		);
	};

	/**
	 * 获取会话历史消息
	 */
	getConversationHistory = (conversation_id: string) => {
		return this.baseRequest
			.get(
				`/${this.options.appId}/conversation/${conversation_id}/messages`,
				{},
			)
			.then((res) => res.data) as Promise<IGetConversationHistoryResponse>;
	};

	/**
	 * 发送对话消息
	 */
	sendMessage = (params: {
		/**
		 * 对话 ID
		 */
		conversation_id?: string;
		/**
		 * 输入参数
		 */
		inputs: Record<string, string>;
		/**
		 * 附件
		 */
		files: IFile[];
		/**
		 * 用户
		 */
		user: string;
		/**
		 * 响应模式
		 */
		response_mode: "streaming";
		/**
		 * 问题
		 */
		query: string;
	}) => {
		return this.baseRequest.baseRequest(
			`/${this.options.appId}/chat-messages`,
			{
				method: "POST",
				body: JSON.stringify(params),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	};

	/**
	 * 停止对话流式响应
	 */
	stopTask = async (taskId: string) => {
		return this.baseRequest.post(
			`/${this.options.appId}/chat-messages/${taskId}/stop`,
		);
	};

	/**
	 * 上传文件
	 */
	uploadFile = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("user", this.options.user);
		return this.baseRequest
			.baseRequest(`/${this.options.appId}/files/upload`, {
				method: "POST",
				body: formData,
			})
			.then((res) => res.json())
			.then((res) => res.data) as Promise<IUploadFileResponse>;
	};

	/**
	 * 获取下一轮建议问题列表
	 */
	getNextSuggestions = async (params: {
		/**
		 * 消息 ID
		 */
		message_id: string;
	}) => {
		return this.baseRequest
			.get(`/${this.options.appId}/messages/${params.message_id}/suggested`)
			.then((res) => res.data) as Promise<{
			data: string[];
		}>;
	};

	/**
	 * 消息反馈
	 */
	feedbackMessage = (params: {
		/**
		 * 消息 ID
		 */
		messageId: string;
		/**
		 * 反馈类型 like-点赞 dislike-点踩 null-取消
		 */
		rating: "like" | "dislike" | null;
		/**
		 * 反馈内容
		 */
		content: string;
	}) => {
		const { ...restParams } = params;
		return this.baseRequest.post(`/${this.options.appId}/feedback`, {
			...restParams,
		}) as Promise<{
			// 固定返回 success
			result: "success";
		}>;
	};

	/**
	 * 文字转语音
	 */
	text2Audio = async (
		params:
			| {
					/**
					 * 消息 ID，优先级高于 text
					 */
					message_id: string;
			  }
			| {
					/**
					 * 文本内容
					 */
					text: string;
			  },
	) => {
		return this.baseRequest.baseRequest(`/${this.options.appId}/text2audio`, {
			method: "POST",
			body: JSON.stringify(params),
			headers: {
				"Content-Type": "application/json",
			},
		});
	};

	/**
	 * 语音转文本
	 * @param file 语音文件。 支持格式：['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'] 文件大小限制：15MB
	 */
	audio2Text = async (file: File) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("user", this.options.user);
		return this.baseRequest
			.baseRequest(`/${this.options.appId}/audio2text`, {
				method: "POST",
				body: formData,
			})
			.then((res) => res.json())
			.then((res) => res.data) as Promise<IAudio2TextResponse>;
	};

	/**
	 * 执行 workflow
	 */
	runWorkflow = async (params: {
		inputs: Record<string, IFile[] | unknown>;
	}) => {
		return this.baseRequest.baseRequest(
			`/${this.options.appId}/workflows/run`,
			{
				method: "POST",
				body: JSON.stringify({
					...params,
					response_mode: "streaming",
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	};

	/**
	 * 获取 workflow 执行情况
	 */
	getWorkflowResult = async (params: { workflow_run_id: string }) => {
		return this.baseRequest.get(
			`/${this.options.appId}/workflows/run/${params.workflow_run_id}`,
		) as Promise<IGetWorkflowResultResponse>;
	};

	/**
	 * 执行文本生成
	 */
	completion = async (params: {
		inputs: Record<string, IFile[] | unknown>;
	}) => {
		return this.baseRequest.baseRequest(
			`/${this.options.appId}/completion-messages`,
			{
				method: "POST",
				body: JSON.stringify({
					...params,
					response_mode: "streaming",
				}),
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	};
}

/**
 * 创建 Dify API 实例
 */
export const createDifyApiInstance = (options: IDifyApiOptions) => {
	return new DifyApi(options);
};
