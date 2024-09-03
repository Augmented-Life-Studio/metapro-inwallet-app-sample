'use client'
import styled from 'styled-components'
import {useEffect, useMemo, useState} from 'react'
import {useParams} from 'next/navigation'
import {User} from '@/config/types'
import Image from 'next/image'
import {
	ModalWrapper,
	ModalContent,
	SettingsCloseButton,
	UserDetails,
	PageWrapper,
	TopBar,
	SettingsButton,
	AccountBox,
	AvatarBox,
	UserDetailsTitle,
} from '@/components/UserPage'

const UserDetailsModal: React.FC<{user: User; closeModal: () => void}> = ({
	user,
	closeModal,
}) => {
	return (
		<ModalWrapper>
			<ModalContent>
				<SettingsCloseButton onClick={closeModal} />
				<div>{user?.personalDetails?.avatar}</div>
				<UserDetailsTitle>Wallet address</UserDetailsTitle>
				<UserDetails>{user?.addresses[0].wallet}</UserDetails>
				<UserDetailsTitle>METAPRO ID</UserDetailsTitle>
				<UserDetails>{user.userId}</UserDetails>
			</ModalContent>
		</ModalWrapper>
	)
}

export default function Account() {
	const params = useParams()

	const [loadingUser, setLoadingUser] = useState(true)
	const [user, setUser] = useState<User>()
	const [isModalOpen, setIsModalOpen] = useState(false)

	useEffect(() => {
		if (!params?.userId) return
		const fetchUser = async () => {
			try {
				// Fetch user data from the API using the userId from the URL
				const response = await fetch(
					`https://test-api.metaproprotocol.com/ms/users-service/profile/${params?.userId}`,
				)
				const user = (await response.json()) as User
				setUser(user)
			} catch (error) {
				console.error(error)
			} finally {
				setLoadingUser(false)
			}
		}
		fetchUser()
	}, [params?.userId])

	return (
		<PageWrapper
			onClick={e => {
				e.stopPropagation()
				if (isModalOpen) setIsModalOpen(false)
			}}
		>
			{isModalOpen && user ? (
				<UserDetailsModal
					{...{user, closeModal: () => setIsModalOpen(false)}}
				/>
			) : null}
			<TopBar>
				<SettingsButton
					onClick={e => {
						e.stopPropagation()
						setIsModalOpen(prev => !prev)
					}}
				/>
				<AccountBox>
					<AvatarBox>
						<Image
							src={user?.personalDetails?.avatar || ''}
							alt='avatar'
							width={25}
							height={25}
						/>
					</AvatarBox>

					<p>{user?.personalDetails?.username || 'Your nickname'}</p>
				</AccountBox>
			</TopBar>
		</PageWrapper>
	)
}
