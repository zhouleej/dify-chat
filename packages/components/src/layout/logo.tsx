<<<<<<< HEAD:packages/react-app/src/components/logo.tsx
import LogoImage from '@/assets/images/logo.png'
=======
import { GithubOutlined } from "@ant-design/icons";
import { Button } from "antd";

import LogoImage from "../assets/images/logo.png";
>>>>>>> d2b5db35ff486c5a21cf8d847babba91e0d21c82:packages/components/src/layout/logo.tsx

export const LogoIcon = () => {
	return (
		<img
			className="w-5 h-5 inline-block"
			src={LogoImage}
			draggable={false}
			alt="logo"
		/>
	);
};

<<<<<<< HEAD:packages/react-app/src/components/logo.tsx
=======
export const GithubIcon = () => {
	return (
		<Button
			type="link"
			href="https://github.com/lexmin0412/dify-chat"
			target="_blank"
			className="!px-0"
		>
			<GithubOutlined className="text-xl cursor-pointer text-theme-text" />
		</Button>
	);
};

>>>>>>> d2b5db35ff486c5a21cf8d847babba91e0d21c82:packages/components/src/layout/logo.tsx
interface ILogoProps {
	/**
	 * 是否隐藏 Github 图标
	 */
	hideGithubIcon?: boolean;
	/**
	 * 是否隐藏文本
	 */
	hideText?: boolean;
}

export const Logo = (props: ILogoProps) => {
<<<<<<< HEAD:packages/react-app/src/components/logo.tsx
	const { hideText } = props
=======
	const { hideGithubIcon, hideText } = props;
>>>>>>> d2b5db35ff486c5a21cf8d847babba91e0d21c82:packages/components/src/layout/logo.tsx

	return (
		<div className="flex h-16 items-center justify-start !py-0 box-border">
			<div className="h-full flex items-center flex-1 overflow-hidden">
				<img
					className="w-8 h-8 inline-block"
					src={LogoImage}
					draggable={false}
					alt="logo"
				/>
				{!hideText ? (
					<span className="inline-block my-0 ml-3 font-bold text-lg text-theme-text">
						中移智能客服
					</span>
				) : null}
			</div>
		</div>
	);
};
