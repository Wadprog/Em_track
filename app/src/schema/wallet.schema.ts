import { z } from 'zod'

// Base schema for Wallet
const walletBase = {
  address: z.string().min(1, 'Address is required'),
  exchange_id: z.number().int().positive('Exchange ID is required'),
  initial_balance: z.number().min(0, 'Initial balance must be non-negative'),
}

// Create Wallet schema
export const createWalletSchema = z.object({
  body: z.object({
    ...walletBase,
  }),
})

// Update Wallet schema
export const updateWalletSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
  body: z
    .object({
      ...walletBase,
    })
    .partial(),
})

// Get Wallet by ID schema
export const getWalletSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// Delete Wallet schema
export const deleteWalletSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// List Wallets schema (with pagination and filtering)
export const listWalletsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default('10'),
    exchange_id: z.string().optional().transform(Number),
    search: z.string().optional(),
    address: z.string().optional(),
  }),
})

export type CreateWalletInput = z.TypeOf<typeof createWalletSchema>['body']
export type UpdateWalletInput = z.TypeOf<typeof updateWalletSchema>['body']
export type WalletParams = z.TypeOf<typeof getWalletSchema>['params']
export type ListWalletsQuery = z.TypeOf<typeof listWalletsSchema>['query']
