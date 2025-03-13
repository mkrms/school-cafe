// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  // テストユーザーの作成
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'test@example.com',
      full_name: 'テスト ユーザー',
    },
  })

  console.log(`Created test user with id: ${testUser.id}`)

  // テスト注文の作成
  const testOrder = await prisma.order.create({
    data: {
      id: uuidv4(),
      user_id: testUser.id,
      total_amount: 1100,
      status: 'completed',
      qr_code: 'test-qr-code',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
      order_items: {
        create: [
          {
            id: uuidv4(),
            strapi_menu_id: 'kvh6bi1g63pf5qimil79tsoy', // 実際のStrapi IDに置き換えること
            menu_item_name: '日替わり定食',
            quantity: 2,
            unit_price: 550,
            strapi_category_id: 'su05y2jzxgosj9qp0dtitq17', // 実際のStrapi IDに置き換えること
            category_name: '定食',
            image_url: 'http://localhost:1338/uploads/medium_juraku1_1024x682_cd53e8cf4d.jpg',
          },
        ],
      },
    },
  })

  console.log(`Created test order with id: ${testOrder.id}`)

  // 進行中の注文も作成
  const pendingOrder = await prisma.order.create({
    data: {
      id: uuidv4(),
      user_id: testUser.id,
      total_amount: 550,
      status: 'pending',
      created_at: new Date(),
      order_items: {
        create: [
          {
            id: uuidv4(),
            strapi_menu_id: 'kvh6bi1g63pf5qimil79tsoy',
            menu_item_name: '日替わり定食',
            quantity: 1,
            unit_price: 550,
            strapi_category_id: 'su05y2jzxgosj9qp0dtitq17',
            category_name: '定食',
            image_url: 'http://localhost:1338/uploads/medium_juraku1_1024x682_cd53e8cf4d.jpg',
          },
        ],
      },
    },
  })

  console.log(`Created pending order with id: ${pendingOrder.id}`)

  // 決済情報のテストデータ
  const testPayment = await prisma.payment.create({
    data: {
      id: uuidv4(),
      order_id: testOrder.id,
      merchant_payment_id: 'test-payment-123',
      provider: 'paypay',
      status: 'completed',
      amount: 1100,
      currency: 'JPY',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
    },
  })

  console.log(`Created test payment with id: ${testPayment.id}`)

  // テスト印刷ログ
  const testPrintLog = await prisma.printLog.create({
    data: {
      id: uuidv4(),
      order_id: testOrder.id,
      printer_name: '厨房プリンター1',
      status: 'success',
      print_timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
    },
  })

  console.log(`Created test print log with id: ${testPrintLog.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })