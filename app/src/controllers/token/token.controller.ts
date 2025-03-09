import { Request, Response } from 'express'
import { db } from '../../models'
import {
  CreateTokenInput,
  UpdateTokenInput,
  ListTokensQuery,
} from '../../schema/token.schema'

export class TokenController {
  // Create a new token
  async create(req: Request<{}, {}, CreateTokenInput>, res: Response) {
    try {
      const token = await db.Token.create(req.body)
      return res.status(201).json(token)
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Token with this mint address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get all tokens with pagination
  async list(req: Request<{}, {}, {}, ListTokensQuery>, res: Response) {
    try {
      const { page = 1, limit = 10, search, wallet_id, origin } = req.query
      const offset = (page - 1) * limit

      const where: any = {}

      if (search) {
        where.mint = { [db.Sequelize.Op.iLike]: `%${search}%` }
      }

      if (wallet_id) {
        where.wallet_id = wallet_id
      }

      if (origin) {
        where.origin = origin
      }

      const { count, rows } = await db.Token.findAndCountAll({
        where,
        // include: [
        //   {
        //     model: db.Wallet,
        //     include: [{ model: db.Exchange }],
        //   },
        // ],
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

  // Get token by ID
  async getById(req: Request, res: Response) {
    try {
      const token = await db.Token.findByPk(req.params.id, {
        include: [
          {
            model: db.Wallet,
            include: [{ model: db.Exchange }],
          },
        ],
      })

      if (!token) {
        return res.status(404).json({ message: 'Token not found' })
      }

      const transactions = await db.Transaction.findAll({
        where: { token_id: token.id },
        include: [
          {
            model: db.Wallet,
            as: 'sourceWallet',
            include: [{ model: db.Exchange }],
          },
          {
            model: db.Wallet,
            as: 'destinationWallet',
            include: [{ model: db.Exchange }],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      })

      return res.json({
        data: {
          token,
          transactions,
        },
      })
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Update token
  async update(
    req: Request<{ id: string }, {}, UpdateTokenInput>,
    res: Response
  ) {
    try {
      const token = await db.Token.findByPk(req.params.id)

      if (!token) {
        return res.status(404).json({ message: 'Token not found' })
      }

      const updatedToken = await token.update(req.body)
      return res.json({
        data: updatedToken,
      })
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Token with this mint address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Delete token
  async delete(req: Request, res: Response) {
    try {
      const token = await db.Token.findByPk(req.params.id)

      if (!token) {
        return res.status(404).json({ message: 'Token not found' })
      }

      const transactionCount = await db.Transaction.count({
        where: { token_id: token.id },
      })

      if (transactionCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete token with associated transactions',
        })
      }

      await token.destroy()
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
