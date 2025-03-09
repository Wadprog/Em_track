import { Request, Response } from 'express'
import { db } from '../../models/index'
import {
  CreateWalletInput,
  UpdateWalletInput,
  ListWalletsQuery,
} from '../../schema/wallet.schema'

export class WalletController {
  // Create a new wallet
  async create(req: Request<{}, {}, CreateWalletInput>, res: Response) {
    try {
      // Verify exchange exists
      // const exchange = await db.Exchange.findByPk(req.body.exchange_id)
      // if (!exchange) {
      //   return res.status(404).json({ message: 'Exchange not found' })
      // }
      delete req.body.exchange_id
      // @ts-ignore
      delete req.body.exchangeId

      const wallet = await db.Wallet.create(req.body)
      return res.status(201).json(wallet)
    } catch (error: any) {
      console.log('[save wallet error]', error)
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Wallet with this address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get all wallets with pagination and filtering
  async list(req: Request<{}, {}, {}, ListWalletsQuery>, res: Response) {
    try {
      const { page = 1, limit = 10, exchange_id, search, address } = req.query
      const offset = (page - 1) * limit

      const where: any = {}
      if (exchange_id) {
        where.exchange_id = exchange_id
      }
      if (address) {
        where.address = address
      }
      if (search) {
        where.address = { [db.Sequelize.Op.iLike]: `%${search}%` }
      }

      const { count, rows } = await db.Wallet.findAndCountAll({
        where,
        // include: [
        //   {
        //     model: db.Exchange,
        //     as: 'exchange',
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
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get wallet by ID
  async getById(req: Request, res: Response) {
    try {
      const wallet = await db.Wallet.findByPk(req.params.id, {
        include: [
          {
            model: db.Exchange,
            as: 'exchange',
          },
          {
            model: db.Token,
            as: 'tokens',
          },
        ],
      })

      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' })
      }

      return res.json(wallet)
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Update wallet
  async update(
    req: Request<{ id: string }, {}, UpdateWalletInput>,
    res: Response
  ) {
    try {
      const wallet = await db.Wallet.findByPk(req.params.id)

      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' })
      }

      if (req.body.exchange_id) {
        const exchange = await db.Exchange.findByPk(req.body.exchange_id)
        if (!exchange) {
          return res.status(404).json({ message: 'Exchange not found' })
        }
      }

      await wallet.update(req.body)
      return res.json(wallet)
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Wallet with this address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Delete wallet
  async delete(req: Request, res: Response) {
    try {
      const wallet = await db.Wallet.findByPk(req.params.id)

      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' })
      }

      await wallet.destroy()
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
