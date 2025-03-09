import { Request, Response } from 'express'
import { db } from '../../models'
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
} from '../../schema/transaction.schema'

export class TransactionController {
  // Create a new transaction
  async create(req: Request<{}, {}, CreateTransactionInput>, res: Response) {
    try {
      // Verify wallets exist
      const [sourceWallet, destWallet] = await Promise.all([
        db.Wallet.findByPk(req.body.wallet_from_id),
        db.Wallet.findByPk(req.body.wallet_to_id),
      ])

      if (!sourceWallet) {
        return res.status(404).json({ message: 'Source wallet not found' })
      }
      if (!destWallet) {
        return res.status(404).json({ message: 'Destination wallet not found' })
      }

      // Verify token exists
      const token = await db.Token.findByPk(req.body.token_id)
      if (!token) {
        return res.status(404).json({ message: 'Token not found' })
      }

      const transaction = await db.Transaction.create(req.body)
      return res.status(201).json(transaction)
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get all transactions with pagination and filtering
  async list(req: Request<{}, {}, {}, ListTransactionsQuery>, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        wallet_from_id,
        wallet_to_id,
        token_id,
        min_amount,
        max_amount,
        date_from,
        date_to,
      } = req.query
      const offset = (page - 1) * limit

      const where: any = {}
      if (wallet_from_id) {
        where.wallet_from_id = wallet_from_id
      }
      if (wallet_to_id) {
        where.wallet_to_id = wallet_to_id
      }
      if (token_id) {
        where.token_id = token_id
      }
      if (min_amount || max_amount) {
        where.amount = {}
        if (min_amount) {
          where.amount[db.Sequelize.Op.gte] = min_amount
        }
        if (max_amount) {
          where.amount[db.Sequelize.Op.lte] = max_amount
        }
      }
      if (date_from || date_to) {
        where.created_at = {}
        if (date_from) {
          where.created_at[db.Sequelize.Op.gte] = date_from
        }
        if (date_to) {
          where.created_at[db.Sequelize.Op.lte] = date_to
        }
      }

      const { count, rows } = await db.Transaction.findAndCountAll({
        where,
        include: [
          {
            model: db.Wallet,
            as: 'sourceWallet',
            include: [{ model: db.Exchange, as: 'exchange' }],
          },
          {
            model: db.Wallet,
            as: 'destinationWallet',
            include: [{ model: db.Exchange, as: 'exchange' }],
          },
          {
            model: db.Token,
            as: 'token',
          },
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      })

      return res.json({
        data: rows,
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get transaction by ID
  async getById(req: Request, res: Response) {
    try {
      const transaction = await db.Transaction.findByPk(req.params.id, {
        include: [
          {
            model: db.Wallet,
            as: 'sourceWallet',
            include: [{ model: db.Exchange, as: 'exchange' }],
          },
          {
            model: db.Wallet,
            as: 'destinationWallet',
            include: [{ model: db.Exchange, as: 'exchange' }],
          },
          {
            model: db.Token,
            as: 'token',
          },
        ],
      })

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' })
      }

      return res.json(transaction)
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Update transaction
  async update(
    req: Request<{ id: string }, {}, UpdateTransactionInput>,
    res: Response
  ) {
    try {
      const transaction = await db.Transaction.findByPk(req.params.id)

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' })
      }

      if (req.body.wallet_from_id || req.body.wallet_to_id) {
        const [sourceWallet, destWallet] = await Promise.all([
          req.body.wallet_from_id
            ? db.Wallet.findByPk(req.body.wallet_from_id)
            : Promise.resolve(true),
          req.body.wallet_to_id
            ? db.Wallet.findByPk(req.body.wallet_to_id)
            : Promise.resolve(true),
        ])

        if (sourceWallet === null) {
          return res.status(404).json({ message: 'Source wallet not found' })
        }
        if (destWallet === null) {
          return res
            .status(404)
            .json({ message: 'Destination wallet not found' })
        }
      }

      if (req.body.token_id) {
        const token = await db.Token.findByPk(req.body.token_id)
        if (!token) {
          return res.status(404).json({ message: 'Token not found' })
        }
      }

      await transaction.update(req.body)
      return res.json(transaction)
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Delete transaction
  async delete(req: Request, res: Response) {
    try {
      const transaction = await db.Transaction.findByPk(req.params.id)

      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' })
      }

      await transaction.destroy()
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
