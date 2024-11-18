import styled from 'styled-components'
import {DesktopBorder} from '.'

export const PageWrapper = styled(DesktopBorder)`
	display: flex;
	flex-direction: column;
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/UserPage.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	z-index: 1;

	/* justify-content: center;
	align-items: center; */
	height: 100vh;
	position: relative;
`
export const TopBar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 35px;
`

export const SettingsButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/SettingButton.png');
	background-size: cover;
	width: 56px;
	height: 46px;
	cursor: pointer;
`

export const SettingsCloseButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/SettingsCloseButton.png');
	background-size: cover;
	width: 56px;
	height: 46px;
	position: absolute;
	top: -20px;
	right: -20px;
	cursor: pointer;
	z-index: 101;
`

export const UseNftButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/UseNftAsset.png');
	background-size: cover;
	width: 114px;
	height: 45px;
	cursor: pointer;
`

export const TrashButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/TrashCan.png');
	background-size: cover;
	width: 56px;
	height: 45px;
	cursor: pointer;
`

export const AccountBox = styled.div`
	position: relative;
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/UserRowContainer.png');
	background-repeat: no-repeat;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	padding: 0px 19px;
	height: 29px;
	width: 158px;
	color: #fff;
	font-family: Knewave;
	font-size: 12px;
	p {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
`

export const ModalWrapper = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/UserModalContainer.png');
	background-size: auto;
	background-repeat: no-repeat;
	position: absolute;
	max-width: 356px;
	width: 100%;
	height: 478px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 100;
`

export const ModalContent = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 100%;
`

export const UserDetailsTitle = styled.div`
	color: #fff;
	text-align: center;
	font-family: Knewave;
	font-size: 9px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	letter-spacing: 0.72px;
`

export const UserDetails = styled.div`
	color: #ffbb01;
	font-family: Knewave;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
`

export const AvatarBox = styled.div`
	position: absolute;
	left: -10px;
	width: 25px;
	height: 25px;
`

export const FlexRow = styled.div`
	display: flex;
	align-items: center;
`

export const FlexColumn = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`

export const StyledButton = styled.button`
	height: 46px;
	border-radius: 10px;
	border: none;
	padding: 0 20px;
	cursor: pointer;
	// when hover on button change background color
	&:hover {
		background-color: #ffbb01;
	}
`

export const PointsButton = styled.div<{type: 'ADD' | 'REDUCE'}>`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/${props =>
		props.type === 'ADD' ? 'AddButton' : 'ReduceButton'}.png');
	background-size: cover;
	width: 46px;
	height: 40px;
	cursor: pointer;
`

export const LeaderboardButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/LeaderboardButton.png');
	background-size: cover;
	width: 252px;
	height: 56px;
	cursor: pointer;
`
