/** @type {import('next').NextConfig} */
const nextConfig = {
	compiler: {
		styledComponents: true,
	},
	images: {
		domains: [],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				port: '',
				pathname: '/**',
			},
		],
	},
}

export default nextConfig
