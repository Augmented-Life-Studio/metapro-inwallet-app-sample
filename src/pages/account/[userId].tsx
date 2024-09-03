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
const fatchUserData = async (userId: string): Promise<User> => {
	const response = await fetch(
		`https://test-api.metaproprotocol.com/ms/users-service/profile/${userId}`,
	)
	return (await response.json()) as User
}

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
				const user = await fatchUserData(params.userId as string)
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
				{loadingUser ? (
					<>LOADING...</>
				) : (
					<>
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
					</>
				)}
			</TopBar>
		</PageWrapper>
	)
}
