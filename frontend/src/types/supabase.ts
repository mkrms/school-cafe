// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: string
          qr_code: string | null
          payment_id: string | null
          payment_status: string | null
          notes: string | null
          cancel_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: string
          qr_code?: string | null
          payment_id?: string | null
          payment_status?: string | null
          notes?: string | null
          cancel_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: string
          qr_code?: string | null
          payment_id?: string | null
          payment_status?: string | null
          notes?: string | null
          cancel_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // 他のテーブル定義はプロジェクトの進行に応じて追加
    }
  }
}