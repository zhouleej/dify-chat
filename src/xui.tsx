import {
  Attachments,
  Bubble,
  Conversations,
  Prompts,
  Sender,
  useXAgent,
  useXChat,
  XProvider,
  XStream,
  BubbleProps,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

import {
  CloudUploadOutlined,
  FireOutlined,
  LinkOutlined,
  MessageOutlined,
  PlusOutlined,
  ReadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Button,
  Form,
  FormItemProps,
  type GetProp,
  Input,
  Select,
  Tag,
  Typography,
} from 'antd';
import markdownit from 'markdown-it';
import { createDifyApiInstance, IGetAppInfoResponse } from './utils/dify-api';
import { RESPONSE_MODE, USER } from './config';
import { MessageInfo } from '@ant-design/x/es/useXChat';
import { WelcomePlaceholder } from './components/welcome-placeholder';

const md = markdownit({ html: true, breaks: true });

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100vh;
      border-radius: ${token.borderRadius}px;
      display: flex;
      background: ${token.colorBgContainer};
      font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;

      .ant-prompts {
        color: ${token.colorText};
      }
    `,
    menu: css`
      background: ${token.colorBgLayout}80;
    `,
  };
});

const senderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    description: 'Hot Topics',
    icon: <FireOutlined style={{ color: '#FF4D4F' }} />,
  },
  {
    key: '2',
    description: 'Design Guide',
    icon: <ReadOutlined style={{ color: '#1890FF' }} />,
  },
];

interface IConversationItem {
  key: string;
  label: string;
}

interface IConversationEntryFormItem extends FormItemProps {
  type: 'input' | 'select';
}

const isTempId = (id: string | undefined) => {
  return id?.startsWith('temp');
};

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    // typing: { step: 5, interval: 20 },
    style: {
      maxWidth: '70%',
    },
  },
  user: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};

// 创建 Dify API 实例
const difyApi = createDifyApiInstance({ user: USER });

const XUI: React.FC = () => {
  const [entryForm] = Form.useForm();
  const { styles } = useStyle();
  const [content, setContent] = useState('');
  const [conversationsItems, setConversationsItems] = useState<
    IConversationItem[]
  >([]);
  const [curentConversationId, setCurentConversationId] = useState<string>();
  const [userInputItems, setUserInputItems] = useState<
    IConversationEntryFormItem[]
  >([]);
  const [chatInitialized, setChatInitialized] = useState<boolean>(false);
  const [target, setTarget] = useState('');
  const [historyMessages, setHistoryMessages] = useState<MessageInfo<string>[]>(
    [],
  );
  const [appInfo, setAppInfo] = useState<IGetAppInfoResponse>();

  const initAppInfo = async () => {
    // 获取应用信息
    const [baseInfo, _meta] = await Promise.all([
      difyApi.getAppInfo(),
      difyApi.getAppMeta(),
    ]);
    setAppInfo({
      ...baseInfo,
    });
  };

  useEffect(() => {
    initAppInfo();
  }, []);

  const getConversationItems = async () => {
    const result = await difyApi.getConversationList();
    const newItems =
      result?.data?.map((item) => {
        return {
          key: item.id,
          label: item.name,
        };
      }) || [];
    setConversationsItems(newItems);
  };

  useEffect(() => {
    getConversationItems();
  }, []);

  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onUpdate }) => {
      console.log('进来了吗', message);

      // 发送消息
      const response = await difyApi.sendMessage({
        inputs: {
          target,
        },
        conversation_id: !isTempId(curentConversationId)
          ? curentConversationId
          : undefined,
        files: [],
        user: USER,
        response_mode: RESPONSE_MODE,
        query: message,
      });

      let result = '';

      for await (const chunk of XStream({
        readableStream: response.body,
      })) {
        console.log('new chunk', chunk);
        if (chunk.data) {
          console.log('chunk.data', chunk.data);
          let parsedData = {};
          try {
            parsedData = JSON.parse(chunk.data);
          } catch (error) {
            console.error('解析 JSON 失败', error);
          }
					if (parsedData.event === 'message_end') {
						console.log('success一次', result)
      			onSuccess(result);
          }
          if (!parsedData.answer) {
            console.log('没有数据', chunk);
          } else {
            const text = parsedData.answer;
            const conversation_id = parsedData.conversation_id;

            // 如果有对话 ID，跟当前的对比一下
            if (conversation_id) {
              // 如果当前对话 ID 是临时 ID, 则更新到当前对话 ID
              if (isTempId(curentConversationId)) {
                setCurentConversationId(conversation_id);
              }
            }
            console.log('text', text);
            result += text;
    				console.log('enter onUpdate', result);
            onUpdate(result);
          }
        } else {
          console.log('没有数据', chunk);
					continue;
        }
      }
    },

		// 一种可以稳定输出没有问题的效果
    // request: async ({ message }, { onSuccess, onUpdate }) => {
    //   const fullContent = `Streaming output instead of Bubble typing effect. You typed: ${message}`;
    //   let currentContent = '';

    //   const id = setInterval(() => {
    //     currentContent = fullContent.slice(0, currentContent.length + 2);
		// 		console.log('onUpdate', currentContent);
    //     onUpdate(currentContent);

    //     if (currentContent === fullContent) {
    //       clearInterval(id);
    //       onSuccess(fullContent);
    //     }
    //   }, 100);
    // },
  });

  const { onRequest, messages, setMessages } = useXChat({
    agent,
  });

  useEffect(() => {
    if (curentConversationId !== undefined) {
      setMessages([]);
    }
  }, [curentConversationId]);

  const onSubmit = (nextContent: string) => {
    console.log('enter onSubmit', nextContent);
    if (!nextContent) return;
    console.log('onSubmit', nextContent);
    onRequest(nextContent);
    setContent('');
  };

  const onChange = (nextContent: string) => {
    setContent(nextContent);
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onRequest(info.data.description as string);
  };

  const onAddConversation = () => {
    // 创建新对话
    const newKey = `temp_${Math.random()}`;
    setConversationsItems([
      ...conversationsItems,
      {
        key: newKey,
        label: `新对话`,
      },
    ]);
    setCurentConversationId(newKey);
  };

  const handleAddConversationBtnClick = async () => {
    setHistoryMessages([]);

    // 先获取应用信息
    const result = await difyApi.getAppParameters();
    setChatInitialized(false);

    console.log('result', result.user_input_form);
    // 将参数转换为 Ant Design Form
    if (result.user_input_form?.length) {
      // 有参数则展示表单
      const formItems =
        result.user_input_form?.map((item) => {
          if (item['text-input']) {
            const originalProps = item['text-input'];
            const baseProps: IConversationEntryFormItem = {
              type: 'input',
              label: originalProps.label,
              name: originalProps.variable,
            };
            if (originalProps.required) {
              baseProps.required = true;
              baseProps.rules = [{ required: true, message: '请输入' }];
            }
            return baseProps;
          }
          return {} as IConversationEntryFormItem;
        }) || [];
      setUserInputItems(formItems);
    } else {
      setChatInitialized(true);
    }

    onAddConversation();
  };

  console.log('表单信息', userInputItems);

  const getConversationMessages = async (conversationId: string) => {
    const result = await difyApi.getConversationHistory(conversationId);
    console.log('对话历史', result);

    const newMessages: MessageInfo<string>[] = [];

    if (result.data.length) {
      setTarget(result.data[0]?.inputs?.target);
    }

    result.data.forEach((item) => {
      newMessages.push(
        {
          id: `${item.id}-query`,
          message: item.query,
          status: 'success',
          isHistory: true,
        },
        {
          id: `${item.id}-answer`,
          message: item.answer,
          status: 'success',
          isHistory: true,
        },
      );
    });

    setHistoryMessages(newMessages);
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (
    key,
  ) => {
    setHistoryMessages([]);
    setCurentConversationId(key);
    getConversationMessages(key);
  };

  const renderMarkdown: BubbleProps['messageRender'] = (content) => (
    <Typography>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: used in demo */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  );

  // ==================== Nodes ====================

  const items: GetProp<typeof Bubble.List, 'items'> = useMemo(() => {
		console.log('message变更', [...historyMessages, ...messages]);
    return [...historyMessages, ...messages].filter((item)=>{
			return  true
			// return item.status !== 'loading';
		}).map((messageItem) => {
      const { id, message, status, isHistory } = messageItem;
      const isQuery = id.toString().endsWith('query');
      return {
        key: id,
        // loading: status === 'loading',
        content: message,
        messageRender: renderMarkdown,
        // 用户发送消息时，status 为 local，需要展示为用户头像
        role: isQuery || status === 'local' ? 'user' : 'ai',
        // typing: isHistory
        //   ? undefined
        //   : {
        //       step: 5,
        //       interval: 20,
        //     },
      };
    });
  }, [historyMessages, messages]);

  const attachmentsNode = (
    <Attachments
      beforeUpload={() => false}
      placeholder={{
        icon: <CloudUploadOutlined />,
        title: 'Drag & Drop files here',
        description: 'Support file type: image, video, audio, document, etc.',
      }}
    >
      <Button type="text" icon={<LinkOutlined />} />
    </Attachments>
  );

  const logoNode = (
    <div className="flex h-20 items-center justify-start py-0 px-6 box-border">
      <img
        className="w-6 h-6 inline-block"
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
        draggable={false}
        alt="logo"
      />
      <span className="inline-block my-0 mx-2 font-bold text-gray-700 text-base">
        Ant Design X
      </span>
    </div>
  );

  return (
    <XProvider theme={{ token: { colorPrimary: '#ff4a4a' } }}>
      <div className={styles.layout}>
        {/* 左侧边栏 */}
        <div className={`${styles.menu} w-72 h-full flex flex-col`}>
          {/* 🌟 Logo */}
          {logoNode}
          {/* 🌟 添加会话 */}
          <Button
            onClick={handleAddConversationBtnClick}
            type="link"
            className="bg-[#1677ff0f] border border-solid border-[#1677ff0f] w-[calc(100%-24px)] mt-0 mx-3 mb-6"
            icon={<PlusOutlined />}
          >
            New Conversation
          </Button>
          {/* 🌟 会话管理 */}
          <Conversations
            items={conversationsItems}
            className="py-0 px-3 flex-1 overflow-y-auto"
            activeKey={curentConversationId}
            onActiveChange={onConversationClick}
          />
        </div>

        {/* 右侧聊天窗口 */}
        {!chatInitialized && userInputItems?.length ? (
          <div className="w-full h-full flex items-center justify-center -mt-5">
            <div className="w-96">
              <div className="text-2xl font-bold text-black mb-5">
                Dify Chat
              </div>
              <Form form={entryForm}>
                {userInputItems.map((item) => {
                  return (
                    <Form.Item
                      key={item.name}
                      name={item.name}
                      label={item.label}
                      required={item.required}
                      rules={item.rules}
                    >
                      {item.type === 'input' ? (
                        <Input placeholder="请输入" />
                      ) : item.type === 'select' ? (
                        <Select placeholder="请选择" />
                      ) : (
                        '不支持的控件类型'
                      )}
                    </Form.Item>
                  );
                })}
              </Form>
              <Button
                block
                type="primary"
                icon={<MessageOutlined />}
                onClick={async () => {
                  const result = await entryForm.validateFields();
                  const values = entryForm.getFieldsValue();
                  console.log('表单值', values);
                  console.log('result', result);
                  setTarget(entryForm.getFieldValue('target'));
                  setChatInitialized(true);
                }}
              >
                开始对话
              </Button>
            </div>
          </div>
        ) : curentConversationId ? (
          <div className="h-full w-full my-0 mx-auto box-border flex flex-col p-4 gap-4">
            {/* 🌟 欢迎占位 */}
            {!items.length && (
              <WelcomePlaceholder onPromptItemClick={onPromptsItemClick} />
            )}
            {/* 🌟 消息列表 */}
            <Bubble.List items={items} roles={roles} className="flex-1" />
            {/* 🌟 提示词 */}
            <Prompts
              items={senderPromptsItems}
              onItemClick={onPromptsItemClick}
            />
            {/* 🌟 输入框 */}
            <Sender
              value={content}
              onChange={onChange}
              onSubmit={onSubmit}
              prefix={attachmentsNode}
              loading={agent.isRequesting()}
              className="shadow-xl"
            />
          </div>
        ) : appInfo ? (
          <div className="w-full h-full flex items-center justify-center text-black">
            <div className="flex items-center justify-center flex-col">
              <div className="text-2xl font-bold">{appInfo.name}</div>
              <div className="text-gray-700 text-base max-w-44 mt-3">
                {appInfo.description}
              </div>
              {appInfo.tags ? (
                <div>
                  {appInfo.tags.map((tag) => {
                    return <Tag key={tag}>{tag}</Tag>;
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </XProvider>
  );
};

export default XUI;
