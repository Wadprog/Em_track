import { z } from 'zod'

// Base schema for Token
const tokenBase = {
  mint: z.string().min(1, 'Mint address is required'),
  wallet_id: z.number().int().positive('Wallet ID is required'),
  origin: z.enum(['minted', 'migrated']).default('minted'),
}

// Create Token schema
export const createTokenSchema = z.object({
  body: z.object({
    ...tokenBase,
  }),
})

// Update Token schema
export const updateTokenSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
  body: z
    .object({
      ...tokenBase,
    })
    .partial(),
})

// Get Token by ID schema
export const getTokenSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// Delete Token schema
export const deleteTokenSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// List Tokens schema (with pagination and filtering)
export const listTokensSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default('10'),
    wallet_id: z.string().optional().transform(Number),
    origin: z.enum(['minted', 'migrated']).optional(),
    search: z.string().optional(),
  }),
})

export type CreateTokenInput = z.TypeOf<typeof createTokenSchema>['body']
export type UpdateTokenInput = z.TypeOf<typeof updateTokenSchema>['body']
export type TokenParams = z.TypeOf<typeof getTokenSchema>['params']
export type ListTokensQuery = z.TypeOf<typeof listTokensSchema>['query']
