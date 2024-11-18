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
import {checkIfUserExists, loginOrCreateAccount} from '@/functions/user-service'
import {handleExampleSignature} from '@/functions/web3'

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

	const handleMetaproLogin = async (): Promise<
		CreateOrLoginResponse | undefined
	> => {
		try {
			const userResponse = await loginOrCreateAccount(
				account,
				rulesChecked,
				provider,
			)
			return userResponse
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
				onClick={async () => {
					const user = await handleMetaproLogin()
					if (user) {
						push(`/account/${user.account.userId}`)
						localStorage.setItem('accessToken', user.token.accessToken)
					}
				}}
			/>
			<TransactionButton
				onClick={() => handleExampleSignature(account, provider)}
			/>
		</PageWrapper>
	)
}
