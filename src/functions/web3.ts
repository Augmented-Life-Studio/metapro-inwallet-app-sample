import {Web3Provider} from '@ethersproject/providers'

export /**
 * Handles the signing of a message using the provided Web3 provider and account.
 *
 * This function attempts to sign a predefined message ("This is example transaction")
 * using the `personal_sign` method from the provided Web3 provider. The signed transaction
 * is then returned. If the provider is not passed or an error occurs during the signing process,
 * an error will be thrown or logged to the console.
 *
 * @param {string} account - The Ethereum account address that will sign the transaction.
 * @param {Web3Provider} [provider] - The Web3 provider instance that enables interaction
 * with the Ethereum blockchain. This parameter is optional, but if not provided,
 * the function will throw an error.
 *
 * @returns {Promise<any>} - A promise that resolves to the signed transaction,
 * or logs an error if the signing process fails.
 *
 * @throws {Error} - If the `provider` is not provided, an error is thrown with the message
 * 'Provider not found'.
 *
 * @example
 * const account = "0xYourEthereumAddress";
 * const provider = new ethers.providers.Web3Provider(window.ethereum);
 *
 * handleExampleSignature(account, provider)
 *   .then((transaction) => {
 *     console.log('Signed transaction:', transaction);
 *   })
 *   .catch((error) => {
 *     console.error('Error signing transaction:', error);
 *   });
 */
const handleExampleSignature = async (
	account: string,
	provider?: Web3Provider,
): Promise<any> => {
	try {
		if (!provider) {
			throw new Error('Provider not found')
		}
		const transaction = await provider.send('personal_sign', [
			'This is example transaction',
			account,
		])
		return transaction
	} catch (error) {
		console.error(error)
	}
}
