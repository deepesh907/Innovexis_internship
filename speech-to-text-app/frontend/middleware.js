export const config = {
    matcher: ['/api/:path*'],
};

export default function middleware() {
    // Prevent Next.js from parsing /api requests (so Flask can handle them)
}
