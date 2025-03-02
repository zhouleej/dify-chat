import {
  Conversations,
  XProvider,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import './App.css';

import {
	DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  message,
  Spin,
  type GetProp,
} from 'antd';
import { createDifyApiInstance, IGetAppInfoResponse, IGetAppParametersResponse } from './utils/dify-api';
import { USER } from './config';
import ChatboxWrapper from './components/chatbox-wrapper';
import { Logo } from './components/logo';
import { isTempId } from './utils/utils';

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      width: 100%;
      min-width: 1000px;
      height: 100vh;
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

interface IConversationItem {
  key: string;
  label: string;
}

// 创建 Dify API 实例
const difyApi = createDifyApiInstance({ user: USER });

const XUI: React.FC = () => {
  const { styles } = useStyle();
  const [conversationsItems, setConversationsItems] = useState<
    IConversationItem[]
  >([]);
  const [conversationListLoading, setCoversationListLoading] = useState<boolean>(false)
  const [curentConversationId, setCurentConversationId] = useState<string>();
  const [appInfo, setAppInfo] = useState<IGetAppInfoResponse>();
  const [appParameters, setAppParameters] = useState<IGetAppParametersResponse>();

  const initAppInfo = async () => {
    // 获取应用信息
    const [baseInfo, _meta, appParameters] = await Promise.all([
      difyApi.getAppInfo(),
      difyApi.getAppMeta(),
      difyApi.getAppParameters()
    ]);
    setAppInfo({
      ...baseInfo,
    });
    setAppParameters(appParameters);
  };

  useEffect(() => {
    initAppInfo();
  }, []);

  const getConversationItems = async () => {
		setCoversationListLoading(true);
		try {
			const result = await difyApi.getConversationList();
			const newItems =
				result?.data?.map((item) => {
					return {
						key: item.id,
						label: item.name,
					};
				}) || [];
			setConversationsItems(newItems);
		} catch (error) {
			console.error(error);
			message.error(`获取会话列表失败: ${error}`);
		} finally {
			setCoversationListLoading(false);
		}
  };

  useEffect(() => {
    getConversationItems();
  }, []);

  const onAddConversation = () => {
    // 创建新对话
    const newKey = `temp_${Math.random()}`;
    setConversationsItems([
      {
        key: newKey,
        label: `新对话`,
      },
      ...conversationsItems,
    ]);
    setCurentConversationId(newKey);
  };

  const handleAddConversationBtnClick = async () => {
    onAddConversation();
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (
    key,
  ) => {
    setCurentConversationId(key);
  };

  useEffect(() => {
    // 如果对话 ID 不在当前列表中，则刷新一下
    if (
      curentConversationId &&
      !conversationsItems.some((item) => item.key === curentConversationId)
    ) {
      getConversationItems()
    }
  }, [curentConversationId]);

  return (
    <XProvider theme={{ token: { colorPrimary: '#1689fe' } }}>
      <div className={styles.layout}>
        {/* 左侧边栏 */}
        <div className={`${styles.menu} w-72 h-full flex flex-col`}>
          {/* 🌟 Logo */}
          <Logo />
          {/* 🌟 添加会话 */}
          <Button
            onClick={handleAddConversationBtnClick}
            className="border border-solid border-[#1689fe] w-[calc(100%-24px)] mt-0 mx-3 text-[#1689fe]"
            icon={<PlusOutlined />}
          >
            New Conversation
          </Button>
          {/* 🌟 会话管理 */}
          <div className="py-0 px-3 flex-1 overflow-y-auto">
            <Spin spinning={conversationListLoading}>
              <Conversations
								className='p-0'
                items={conversationsItems}
                activeKey={curentConversationId}
                onActiveChange={onConversationClick}
                menu={(conversation) => ({
                  items: [
                    {
                      label: '删除',
                      key: 'delete',
                      icon: <DeleteOutlined />,
                      danger: true,
                    },
                  ],
                  onClick: async (menuInfo) => {
                    menuInfo.domEvent.stopPropagation();
                    console.log('menuInfo', conversation);
                    if (menuInfo.key === 'delete') {
                      if (isTempId(conversation.key)) {
                        // 如果是临时对话，则直接删除
                        setConversationsItems(
                          conversationsItems.filter(
                            (item) => item.key !== conversation.key,
                          ),
                        );
                        message.success('删除成功');
                      } else {
                        // 否则调用删除接口
                        await difyApi.deleteConversation(conversation.key);
                        message.success('删除成功');
                        getConversationItems();
                      }
                      if (curentConversationId === conversation.key) {
                        setCurentConversationId(undefined);
                      }
                    }
                  },
                })}
              />
            </Spin>
          </div>
        </div>

        {/* 右侧聊天窗口 */}
        <ChatboxWrapper
          appInfo={appInfo}
          difyApi={difyApi}
          conversationId={curentConversationId}
          conversationName={
            conversationsItems.find((item) => item.key === curentConversationId)
              ?.label || ''
          }
          onConversationIdChange={setCurentConversationId}
          appParameters={appParameters}
        />
      </div>
    </XProvider>
  );
};

export default XUI;
