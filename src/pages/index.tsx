'use client'
import {useEffect, useState} from 'react'
import {ExternalProvider, Web3Provider} from '@ethersproject/providers'
import {useRouter} from 'next/router'
import {CheckWalletResponse, CreateOrLoginResponse, User} from '@/config/types'
import {
	LoginButton,
	PageWrapper,
	RegulationsWrapper,
	TransactionButton,
} from '@/components/MainPage'
import {UserDetails, UserDetailsTitle} from '@/components/UserPage'

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
const loginOrCreateAccount = async (
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
const checkIfUserExists = async (
	account: string,
): Promise<CheckWalletResponse> => {
	const checkAccountRequest = await fetch(
		`https://test-api.metaproprotocol.com/ms/users-service/auth/check/wallet/${account}?projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
	)
	const checkWalletResponse = (await checkAccountRequest.json()) as CheckWalletResponse
	return checkWalletResponse
}

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

export default function Home() {
	const [account, setAccount] = useState('')
	const [chainId, setChainId] = useState(0)
	const [provider, setProvider] = useState<Web3Provider>()
	const [displayRulesCheckbox, setDisplayRulesCheckbox] = useState(true)
	const [rulesChecked, setRulesChecked] = useState(true)

	const {push} = useRouter()

	useEffect(() => {
		const handleWeb3 = async () => {
			try {
				const provider = new Web3Provider(window.ethereum as ExternalProvider)
				// To prevent TS error add window.ethereum to window object in global.d.ts
				if (provider && window.ethereum) {
					setProvider(provider)
					const signer = await provider.getSigner()
					const account = await signer.getAddress()
					const network = await provider.getNetwork()
					const localLowerCaseAccount = account.toLowerCase()
					setChainId(network.chainId)
					setAccount(localLowerCaseAccount)
					window.ethereum.on('accountsChanged', async (accounts: string[]) => {
						setAccount(accounts[0].toLowerCase())
					})
					window.ethereum.on('chainChanged', async (chainId: string) => {
						setChainId(parseInt(chainId, 16))
					})
					const checkUserExistanceResponse = await checkIfUserExists(
						localLowerCaseAccount,
					)
					// When user does not exists in metapro we can handle logic for example to check rules and create account
					if (checkUserExistanceResponse?.rulesCheckbox) {
						setDisplayRulesCheckbox(checkUserExistanceResponse?.rulesCheckbox)
						setRulesChecked(false)
						return
					}
				}
			} catch (error) {
				console.error(error)
			}
		}
		handleWeb3()

		return () => {
			if (provider) {
				provider.removeAllListeners('accountsChanged')
				provider.removeAllListeners('chainChanged')
			}
		}
	}, [])

	const handleMetaproLogin = async () => {
		try {
			const userResponse = await loginOrCreateAccount(
				account,
				rulesChecked,
				provider,
			)
			await push(`account/${userResponse?.account?.userId}`)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<PageWrapper>
			<UserDetailsTitle>Wallet address</UserDetailsTitle>
			<UserDetails> {account}</UserDetails>
			<UserDetailsTitle>Chain ID: {chainId}</UserDetailsTitle>
			<UserDetails style={{marginBottom: '8px'}}>{chainId}</UserDetails>
			<RegulationsWrapper>
				{displayRulesCheckbox && (
					<>
						<input
							type='checkbox'
							onChange={e => {
								setRulesChecked(e.target.checked)
							}}
							checked={rulesChecked}
						/>
						<span
							style={{
								marginLeft: '16px',
								fontSize: '12px',
								textTransform: 'uppercase',
							}}
						>
							I have read the regulations and privacy policy of the website
						</span>
					</>
				)}
			</RegulationsWrapper>
			<LoginButton
				// disabled={!provider || !rulesChecked}
				onClick={handleMetaproLogin}
			/>
			<TransactionButton
				onClick={() => handleExampleSignature(account, provider)}
			/>
		</PageWrapper>
	)
}
