/**
 * Fetches NFT metadata assets for a given wallet address from the MetaPro Protocol NFT service.
 *
 * This function makes an asynchronous HTTP GET request to the MetaPro Protocol API, retrieving
 * a list of NFTs associated with a specific wallet address. The NFTs are sorted by their
 * creation block in descending order. The response is returned as a parsed JSON object.
 *
 * @param {string} walletAddress - The wallet address for which NFT metadata assets are being fetched.
 *
 * @returns {Promise<any>} - A promise that resolves to the list of NFT metadata assets associated
 * with the wallet address.
 *
 * @throws {Error} - If the fetch operation fails, the promise may reject with an error indicating
 * the failure of the request or the inability to parse the response.
 *
 * @example
 * const walletAddress = "0xYourWalletAddress";
 *
 * fetchWalletNftMetaAssets(walletAddress)
 *   .then((nftAssets) => {
 *     console.log('NFT Assets:', nftAssets);
 *   })
 *   .catch((error) => {
 *     console.error('Error fetching NFT assets:', error);
 *   });
 */
export const fetchWalletNftMetaAssets = async (walletAddress: string) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_NFT_SERVICE_URL}/v1/user/${walletAddress}/tokens?sort%5Btoken.creationBlock%5D=desc`,
	)
	return await response.json()
}
