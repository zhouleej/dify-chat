import { Attachments, Bubble, Prompts, Sender } from '@ant-design/x';
import { WelcomePlaceholder } from './welcome-placeholder';
import { Button, GetProp } from 'antd';
import {
  CloudUploadOutlined,
  FireOutlined,
  LinkOutlined,
  ReadOutlined,
  UserOutlined,
} from '@ant-design/icons';

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    style: {
      maxWidth: '70%',
    },
  },
  user: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};

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

export interface ChatboxProps {
  items: GetProp<typeof Bubble.List, 'items'>;
  content: string;
  isRequesting: boolean;
  onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'>;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

/**
 * 对话内容区
 */
export const Chatbox = ({
  items,
  content,
  isRequesting,
  onPromptsItemClick,
  onChange,
  onSubmit,
}: ChatboxProps) => {
  // 文件上传
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

  return (
    <div className="w-full h-full overflow-hidden my-0 mx-auto box-border flex flex-col gap-4 relative">
      <div className="w-full h-full overflow-auto pt-4 pb-40">
        {/* 🌟 欢迎占位 */}
        {!items?.length && (
          <WelcomePlaceholder onPromptItemClick={onPromptsItemClick} />
        )}
        {/* 🌟 消息列表 */}
        <Bubble.List items={items} roles={roles} className="flex-1 w-3/4 mx-auto" />
        <div className="absolute bottom-0 pb-6 pt-3 bg-white w-3/4 left-1/2" style={{
          transform: 'translateX(-50%)'
        }}>
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
            loading={isRequesting}
            className="shadow-2xl bg-white w-full mt-3"
          />
        </div>
      </div>
    </div>
  );
};
