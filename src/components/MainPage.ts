import styled from 'styled-components'
import {DesktopBorder} from '.'

export const PageWrapper = styled(DesktopBorder)`
	display: flex;
	flex-direction: column;
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/MainPage.png');
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	align-items: center;
	justify-content: flex-end;
	padding: 0px 54px 69px 54px;

	/* justify-content: center;
	align-items: center; */
	height: 100vh;
	position: relative;
`

export const RegulationsWrapper = styled.div`
	display: flex;
`

export const LoginButton = styled.div<{disabled: boolean}>`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/LoginButton.png');
	background-size: cover;
	width: 300px;
	height: 80px;
	width: 304.549px;
	height: 100px;
	flex-shrink: 0;
	margin-top: 16px;
	opacity: ${props => (props.disabled ? 0.5 : 1)};
	cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`

export const TransactionButton = styled.div`
	background-image: url('https://metaprotocolresources.blob.core.windows.net/metapro-demo/TransactionButton.png');
	background-size: cover;
	width: 300px;
	height: 80px;
	cursor: pointer;
	width: 252.005px;
	height: 56.007px;
	flex-shrink: 0;
	margin-top: 16px;
`
