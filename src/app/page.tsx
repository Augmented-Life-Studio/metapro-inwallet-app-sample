'use client'
import {useEffect, useState} from 'react'
import styles from './page.module.css'
import {ExternalProvider, Web3Provider} from '@ethersproject/providers'

export default function Home() {
	const [account, setAccount] = useState('')
	const [provider, setProvider] = useState<any>()
	const [currentUserID, setCurrentUserID] = useState('')

	useEffect(() => {
		const handleWeb3Login = async () => {
			try {
				const provider = new Web3Provider(window.ethereum as ExternalProvider)
				// To prevent TS error add window.ethereum to window object in global.d.ts
				if (provider) {
					setProvider(provider)
					const accounts = (await provider.listAccounts()) as string[]
					if (accounts.length > 0) {
						setAccount(accounts[0].toLowerCase())
					}
				}
			} catch (error) {
				console.error(error)
			}
		}
		handleWeb3Login()
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

	return (
		<main className={styles.main}>
			<div className={styles.description}>
				<p>Your web3 account: {account}</p>
			</div>
			<div className={styles.description}>
				<p>Your metaproID: {currentUserID}</p>
			</div>
			<div className={styles.description}>
				<button
					disabled={currentUserID.length > 0 || !provider}
					onClick={handleMetaproLogin}
				>
					Login to metapro
				</button>
			</div>
			<div className={styles.grid}></div>
		</main>
	)
}
