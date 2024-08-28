'use client'
import {useEffect, useState} from 'react'
import styles from './page.module.css'
import {ExternalProvider, Web3Provider} from '@ethersproject/providers'
console.log(styles)

export default function Home() {
	const [account, setAccount] = useState('')
	const [chainId, setChainId] = useState(0)
	const [provider, setProvider] = useState<any>()
	const [currentUserID, setCurrentUserID] = useState('')

	useEffect(() => {
		const handleWeb3Login = async () => {
			try {
				const provider = new Web3Provider(window.ethereum as ExternalProvider)
				// To prevent TS error add window.ethereum to window object in global.d.ts
				if (provider && window.ethereum) {
					setProvider(provider)
					const signer = await provider.getSigner()
					const account = await signer.getAddress()
					const network = await provider.getNetwork()
					setChainId(network.chainId)
					setAccount(account.toLowerCase())
					window.ethereum.on('accountsChanged', async (accounts: string[]) => {
						setAccount(accounts[0].toLowerCase())
					})
					window.ethereum.on('chainChanged', async (chainId: string) => {
						setChainId(parseInt(chainId, 16))
					})
				}
			} catch (error) {
				console.error(error)
			}
		}
		handleWeb3Login()

		return () => {
			if (provider) {
				provider.removeAllListeners('accountsChanged')
				provider.removeAllListeners('chainChanged')
			}
		}
	}, [])

	const handleMetaproLogin = async () => {
		try {
			const provider = new Web3Provider(window.ethereum as ExternalProvider)
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

			const balance = await provider.getBalance(account)

			console.log(balance)

			// Create a message to sign. Remember to include the account address and the hash. Account address should be in lowercase in every step
			const verifyMessage = `Please sign to let us verify\nthat you are the owner of this address\n${account}\n\nRequest ID ${hash}`
			const signature = await provider.send('personal_sign', [
				verifyMessage,
				account,
			])

			// We can check if account is already registered in metapro
			// const checkAccountRequest = await fetch(
			// 	`https://test-api.metaproprotocol.com/ms/users-service/auth/check/wallet/${account}?projectId=${process.env.NEXT_PUBLIC_PROJECT_ID}`,
			// )

			// const checkWalletResponse = await checkAccountRequest.json()
			// When user does not exists in metapro we can handle logic for example to check rules and create account
			// if (!checkWalletResponse?.hasAccount) {
			// 	// Handle logic for example check rules and create account
			// 	return
			// }

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
						rulesChecked: true, // This should be true if you have checked the rules
						projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
					}),
				},
			)
			const createAccountResponse = await createOrLoginAccountRequest.json()
			setCurrentUserID(createAccountResponse?.account?.userId)
		} catch (error) {
			console.error(error)
		}
	}

	const handleExampleTransaction = async () => {
		try {
			const provider = new Web3Provider(window.ethereum as ExternalProvider)
			const transaction = await provider.send('personal_sign', [
				'This is example transaction',
				account,
			])
			console.log(transaction)
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<main className={styles.main}>
			<div className={styles.description}>
				<p>Wallet address: {account}</p>
			</div>
			<div className={styles.description}>
				<p>Chain ID: {chainId}</p>
			</div>
			<div className={styles.description}>
				<button
					disabled={currentUserID.length > 0 || !provider}
					onClick={handleMetaproLogin}
				>
					Login to metapro
				</button>
			</div>
			<div className={styles.description}>
				<button onClick={handleExampleTransaction}>
					Send example transaction
				</button>
			</div>
			<div className={styles.grid}></div>
		</main>
	)
}
