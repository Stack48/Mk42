import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  return Response.json({ isAuthenticated: !!userId, userId: userId ?? null })
}
