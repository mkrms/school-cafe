import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

// ユーザー一覧取得API
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        orders: true, // ユーザーに関連する注文も取得
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}