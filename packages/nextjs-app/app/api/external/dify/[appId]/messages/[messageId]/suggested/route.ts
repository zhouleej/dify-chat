import { genDifyRequest } from "@/app/api/utils";
import { getUserIdFromNextRequest } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

const GET = async (
	request: NextRequest,
	{
		params,
	}: {
		params: Promise<{
			appId: string;
			conversationId: string;
			messageId: string;
		}>;
	},
) => {
	const { appId, messageId } = await params;
	const user = await getUserIdFromNextRequest(request);
	const difyRequest = await genDifyRequest(appId);
	const result = await difyRequest.get(`/messages/${messageId}/suggested`, {
		user,
	});
	return NextResponse.json({
		code: 200,
		data: result,
	});
};

export { GET };
