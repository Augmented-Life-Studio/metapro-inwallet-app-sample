import {
	CreateOrLoginResponse,
	CheckWalletResponse,
	User,
	FetchUserProfilesParams,
} from '@/config/types'
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
	// Create get request to USER SERVICE to get hash
	// Headers should include x-account-wallet with the account address
	const hashResponse = await fetch(
		`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/auth/signature/hash`,
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
		`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/v2/auth/web3/login`,
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
 * This function makes an asynchronous request to the matapro API
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
		`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/auth/check/wallet/${account}?projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
	)
	const checkWalletResponse = (await checkAccountRequest.json()) as CheckWalletResponse
	return checkWalletResponse
}

/**
 * Fetches user data from the metapro Protocol user service.
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
		`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile/${userId}`,
	)
	return (await response.json()) as User
}

/**
 * Edits and updates user profile information in the metapro Protocol user service.
 *
 * This function sends an HTTP PATCH request to the MetaPro Protocol user service API to
 * update a user's profile details. The request includes user-specific data in the headers
 * and the request body. If the access token is expired (indicated by a 401 status),
 * the function handles re-authentication by logging in again and retrying the update.
 *
 * @param {User} user - The `User` object containing the updated profile details to be submitted.
 *
 * @returns {Promise<any>} - A promise that resolves to the response from the API, typically the updated user profile data.
 *
 * @throws {Error} - If the access token is expired, an `Unauthorized` error is thrown, triggering a login process.
 *
 * @example
 * const user = {
 *   userId: "123456789",
 *   personalDetails: { name: "John Doe", email: "john.doe@example.com" },
 *   addresses: [{ wallet: "0xYourWalletAddress" }],
 * };
 *
 * editUser(user)
 *   .then((updatedUser) => {
 *     console.log('User updated:', updatedUser);
 *   })
 *   .catch((error) => {
 *     console.error('Error updating user:', error);
 *   });
 */
export const editUser = async (user: User) => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/update`,
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

/**
 * Fetches user profiles from the MetaPro Protocol user service.
 *
 * This function sends an HTTP GET request to retrieve multiple user profiles based on specified parameters.
 * The parameters may include user IDs or wallet addresses, as well as other filtering options. The request
 * parameters are appended to the query string, and the response contains a list of user profiles and a count
 * of the results.
 *
 * @param {FetchUserProfilesParams} [params] - An object containing parameters to filter user profiles, such as `userIds` or `wallets`.
 * By default, it includes empty arrays for `userIds` and `wallets`.
 *
 * @returns {Promise<{results: User[]; count: number}>} - A promise that resolves to an object containing the results of the user profiles (`results`)
 * and the total count of matching profiles (`count`).
 *
 * @throws {Error} - If the fetch operation fails, the promise may reject with an error indicating the failure of the request.
 *
 * @example
 * const params = {
 *   userIds: ['12345', '67890'],
 *   wallets: ['0xWalletAddress1', '0xWalletAddress2'],
 * };
 *
 * fetchUsersProfiles(params)
 *   .then(({ results, count }) => {
 *     console.log('Fetched profiles:', results);
 *     console.log('Total count:', count);
 *   })
 *   .catch((error) => {
 *     console.error('Error fetching user profiles:', error);
 *   });
 */
export const fetchUsersProfiles = async (
	params: FetchUserProfilesParams = {
		userIds: [],
		wallets: [],
	} as FetchUserProfilesParams,
): Promise<{results: User[]; count: number}> => {
	const requestParams = new URLSearchParams()

	Object.entries(params).forEach(([key, value]) => {
		if (key === 'userIds' || key === 'wallets') return
		if (value) {
			requestParams.append(key, value)
		}
	})

	if (params.userIds) {
		params.userIds.forEach(userId => {
			requestParams.append('userIds', userId)
		})
	}

	if (params.wallets) {
		params.wallets.forEach(wallet => {
			requestParams.append('wallets', wallet)
		})
	}

	const usersResponse = await fetch(
		`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profiles?${requestParams}`,
	)

	return await usersResponse.json()
}
