/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['*'], // fine for dev, restrict in prod
        },
    },
    api: {
        bodyParser: false,   // needed for file uploads
        responseLimit: false // allows large responses
    }
}

module.exports = nextConfig
