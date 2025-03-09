import { z } from 'zod'

// Base schema for Transaction
const transactionBase = {
  wallet_from_id: z.number().int().positive('Source wallet ID is required'),
  wallet_to_id: z.number().int().positive('Destination wallet ID is required'),
  amount: z.number().positive('Amount must be positive'),
  token_id: z.number().int().positive('Token ID is required'),
}

// Create Transaction schema
export const createTransactionSchema = z.object({
  body: z.object({
    ...transactionBase,
  }),
})

// Update Transaction schema
export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
  body: z
    .object({
      ...transactionBase,
    })
    .partial(),
})

// Get Transaction by ID schema
export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// Delete Transaction schema
export const deleteTransactionSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// List Transactions schema (with pagination and filtering)
export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default('10'),
    wallet_from_id: z.string().optional().transform(Number),
    wallet_to_id: z.string().optional().transform(Number),
    token_id: z.string().optional().transform(Number),
    min_amount: z.string().optional().transform(Number),
    max_amount: z.string().optional().transform(Number),
    date_from: z.string().optional().pipe(z.coerce.date()),
    date_to: z.string().optional().pipe(z.coerce.date()),
  }),
})

export type CreateTransactionInput = z.TypeOf<
  typeof createTransactionSchema
>['body']
export type UpdateTransactionInput = z.TypeOf<
  typeof updateTransactionSchema
>['body']
export type TransactionParams = z.TypeOf<typeof getTransactionSchema>['params']
