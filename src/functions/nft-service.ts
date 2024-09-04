export const fetchWalletNftMetaAssets = async (walletAddress: string) => {
	const response = await fetch(
		`https://test-api.metaproprotocol.com/ms/nft/v1/user/${walletAddress}/tokens?sort%5Btoken.creationBlock%5D=desc`,
	)
	return await response.json()
}
