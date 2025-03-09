import { z } from 'zod'

// Base schema for Exchange
const exchangeBase = {
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
}

// Create Exchange schema
export const createExchangeSchema = z.object({
  body: z.object({
    ...exchangeBase,
  }),
})

// Update Exchange schema
export const updateExchangeSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
  body: z
    .object({
      ...exchangeBase,
    })
    .partial(),
})

// Get Exchange by ID schema
export const getExchangeSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// Delete Exchange schema
export const deleteExchangeSchema = z.object({
  params: z.object({
    id: z.string().or(z.number()).transform(Number),
  }),
})

// List Exchanges schema (with pagination)
export const listExchangesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(Number).default('1'),
    limit: z.string().optional().transform(Number).default('10'),
    search: z.string().optional(),
  }),
})

export type CreateExchangeInput = z.TypeOf<typeof createExchangeSchema>['body']
export type UpdateExchangeInput = z.TypeOf<typeof updateExchangeSchema>['body']
export type ExchangeParams = z.TypeOf<typeof getExchangeSchema>['params']
export type ListExchangesQuery = z.TypeOf<typeof listExchangesSchema>['query']
