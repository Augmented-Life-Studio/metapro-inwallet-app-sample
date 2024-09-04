import {CreateOrLoginResponse, CheckWalletResponse, User} from '@/config/types'
import {ExternalProvider, Web3Provider} from '@ethersproject/providers'

/**
 * Logs in or creates a user account based on their Web3 wallet address.
 *
 * This function first requests a hash from the MetaProtocol API and then prompts the user
 * to sign the message with their Web3 provider. The signed message is sent back to the API
 * to either log in or create a new user account.
 *
 * @param {string} account - The account address of the user to log in or create.
 * @param {boolean} rulesChecked - A boolean indicating if the user has accepted the rules.
 * @param {Web3Provider} [provider] - The Web3 provider to use for signing the message. If not provided, an error is thrown.
 * @returns {Promise<CreateOrLoginResponse>} A promise that resolves to a `CreateOrLoginResponse` object, which contains the result of the login or account creation process.
 *
 * @throws {Error} Throws an error if the Web3 provider is not found or if any of the fetch requests fail.
 *
 * @example
 * try {
 *   const response = await loginOrCreateAccount('0x12345', true, web3Provider);
 *   console.log(response);
 * } catch (error) {
 *   console.error('Failed to log in or create account:', error);
 * }
 */
export const loginOrCreateAccount = async (
	account: string,
	rulesChecked: boolean,
	provider?: Web3Provider,
): Promise<CreateOrLoginResponse> => {
	if (!provider) {
		throw new Error('Provider not found')
	}
	// Create get request to https://api.metaproprotocol.com/users-service/auth/signature/hash to get hash
	// Headers should include x-account-wallet with the account address
	const hashResponse = await fetch(
		'https://test-api.metaproprotocol.com/ms/users-service/auth/signature/hash',
		{
			headers: {
				'x-account-wallet': account,
			},
		},
	)
	const {hash} = await hashResponse.json()
	const verifyMessage = `Please sign to let us verify\nthat you are the owner of this address\n${account}\n\nRequest ID ${hash}`
	const signature = await provider.send('personal_sign', [
		verifyMessage,
		account,
	])
	const createOrLoginAccountRequest = await fetch(
		'https://test-api.metaproprotocol.com/ms/users-service/v2/auth/web3/login',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-account-wallet': account,
				'x-account-login-hash': hash,
			},
			body: JSON.stringify({
				wallet: account,
				signature,
				rulesChecked, // This should be true if you have checked the rules
				projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
			}),
		},
	)
	const createAccountResponse = await createOrLoginAccountRequest.json()
	return createAccountResponse
}

/**
 * Checks if a user exists based on their account address.
 *
 * This function makes an asynchronous request to the MetaProtocol API
 * to determine if the user associated with the given account address exists.
 *
 * @param {string} account - The account address of the user to check.
 * @param {boolean} [verbose=false] - If true, logs additional information.
 * @returns {Promise<CheckWalletResponse>} A promise that resolves to a `CheckWalletResponse` object containing the user's existence status.
 *
 * @throws {Error} Will throw an error if the fetch request fails or if the response cannot be parsed as JSON.
 *
 * @example
 * const response = await checkIfUserExists('0x12345');
 * console.log(response.exists); // true or false
 */
export const checkIfUserExists = async (
	account: string,
): Promise<CheckWalletResponse> => {
	const checkAccountRequest = await fetch(
		`https://test-api.metaproprotocol.com/ms/users-service/auth/check/wallet/${account}?projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
	)
	const checkWalletResponse = (await checkAccountRequest.json()) as CheckWalletResponse
	return checkWalletResponse
}

/**
 * Fetches user data from the MetaPro Protocol user service.
 *
 * This function makes an asynchronous HTTP GET request to the MetaPro Protocol user service API,
 * retrieving the profile information for a specific user based on their user ID. The response
 * is parsed as JSON and returned as a `User` object.
 *
 * @param {string} userId - The unique identifier of the user whose data is being fetched.
 *
 * @returns {Promise<User>} - A promise that resolves to the user's profile data as a `User` object.
 *
 * @throws {Error} - If the fetch operation fails, the promise may reject with an error indicating
 * the failure of the request or the inability to parse the response.
 *
 * @example
 * const userId = "123456789";
 *
 * fatchUserData(userId)
 *   .then((user) => {
 *     console.log('User data:', user);
 *   })
 *   .catch((error) => {
 *     console.error('Error fetching user data:', error);
 *   });
 */
export const fatchUserData = async (userId: string): Promise<User> => {
	const response = await fetch(
		`https://test-api.metaproprotocol.com/ms/users-service/profile/${userId}`,
	)
	return (await response.json()) as User
}

export const editUser = async (user: User) => {
	try {
		const response = await fetch(
			`https://test-api.metaproprotocol.com/ms/users-service/update`,
			{
				method: 'PATCH',
				headers: {
					Accept: '*/*',
					'Content-Type': 'application/json',
					'x-account-userid': user.userId,
					Authorization: `${localStorage.getItem('accessToken')}`,
				},
				body: JSON.stringify({
					personalDetails: user.personalDetails,
					socialMedia: [],
				}),
			},
		)

		if (response.status === 401) {
			// Since the access token is expired, we need to log in again
			throw new Error('Unauthorized')
		}
		return await response.json()
	} catch (error: any) {
		if (error.message === 'Unauthorized') {
			const loggedUser = await loginOrCreateAccount(
				user.addresses[0].wallet,
				true,
				new Web3Provider(window.ethereum as ExternalProvider),
			)
			const accessToken = loggedUser.token.accessToken
			localStorage.setItem('accessToken', accessToken)
			await editUser(user)
		}
	}
}
