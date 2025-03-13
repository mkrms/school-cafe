export type CartItem = {
  id: string
  documentId: string
  name: string
  price: number
  quantity: number
  options?: {
    name: string
    value: string
    price: number
  }[]
  imageUrl: string
}