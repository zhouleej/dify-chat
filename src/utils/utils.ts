export const isTempId = (id: string | undefined) => {
	return id?.startsWith('temp');
};
