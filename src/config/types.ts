export interface BaseBuilder {
	userId?: string
	createdAt?: string
	updatedAt?: string
}

export interface Wallet extends BaseBuilder {
	wallet: string
	chainId?: number
}

export interface SocialMedia extends BaseBuilder {
	value: string
	name: string
}

export interface RulesCheckbox extends BaseBuilder {
	checked: boolean
	updatedAt: string
}

export interface PersonalDetails extends BaseBuilder {
	email?: string
	username?: string
	bio?: string
	banner?: string
	avatar?: string
	firstName?: string
	lastName?: string
	country?: string
	birthDate?: string
}

export interface User {
	id: string
	userId: string

	role: string | string[]
	addresses: Wallet[]
	socialMedia: SocialMedia[]
	personalDetails?: PersonalDetails

	createdAt: string
	updatedAt: string
	visitedAt?: string

	engagementPoints?: number

	externalAccounts?: {
		name: string
		data: {id?: string; username?: string; email?: string}
	}[]

	rulesCheckbox: RulesCheckbox
}

export interface Token {
	accessToken: string
	tokenType: string
}

export interface CreateOrLoginResponse {
	account: User
	token: Token
}

export interface CheckWalletResponse {
	hasAccount: boolean
	hasExternalAccount: boolean
	rulesCheckbox: boolean
}
export interface LeaderboardTotalScoreResponse {
	_id: string
	scoreTotalId: string
	leaderboardId: string
	userId: string
	currentRoundData: {
		score: number
		diamonds: number
		jumps: number
		time: number
	}
	totalRoundData: {
		score: number
		diamonds: number
		jumps: number
		time: number
	}
	createdAt: string
	updatedAt: string
}

export interface FetchUserProfilesParams {
	skip?: number
	limit?: number
	wallets?: string[]
	userIds?: string[]
}
