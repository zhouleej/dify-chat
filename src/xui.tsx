import {
  Conversations,
  XProvider,
} from '@ant-design/x';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import './App.css';

import {
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  type GetProp,
} from 'antd';
import { createDifyApiInstance, IGetAppInfoResponse, IGetAppParametersResponse } from './utils/dify-api';
import { USER } from './config';
import ChatboxWrapper from './components/chatbox-wrapper';
import { Logo } from './components/logo';


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
    onAddConversation();
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (
    key,
  ) => {
    setCurentConversationId(key);
  };

  return (
    <XProvider theme={{ token: { colorPrimary: '#ff4a4a' } }}>
      <div className={styles.layout}>
        {/* 左侧边栏 */}
        <div className={`${styles.menu} w-72 h-full flex flex-col`}>
          {/* 🌟 Logo */}
          <Logo />
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
        <ChatboxWrapper 
          appInfo={appInfo}
          difyApi={difyApi}
          conversationId={curentConversationId}
          onConversationIdChange={setCurentConversationId}
          appParameters={appParameters}
        />
      </div>
    </XProvider>
  );
};

export default XUI;
