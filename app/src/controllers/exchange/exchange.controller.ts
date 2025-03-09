import { Request, Response } from 'express'
import { db } from '../../models'
import {
  CreateExchangeInput,
  UpdateExchangeInput,
  ListExchangesQuery,
} from '../../schema/exchange.schema'

export class ExchangeController {
  // Create a new exchange
  async create(req: Request<{}, {}, CreateExchangeInput>, res: Response) {
    try {
      const exchange = await db.Exchange.create(req.body)
      return res.status(201).json(exchange)
      // return res.redirect('/exchanges')
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Exchange with this name or address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get all exchanges with pagination
  async list(req: Request<{}, {}, {}, ListExchangesQuery>, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query
      const offset = (page - 1) * limit

      const where = search
        ? {
            [db.Sequelize.Op.or]: [
              { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
              { address: { [db.Sequelize.Op.iLike]: `%${search}%` } },
            ],
          }
        : {}

      const { count, rows } = await db.Exchange.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      })

      return res.json({
        data: rows || [
          {
            id: '1',
            address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
            name: 'Binance 2',
          },
          {
            id: '2',
            address: 'G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t',
            name: 'Random Exchange',
          },
          {
            id: '3',
            address: 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
            name: 'Bybit',
          },
        ],
        meta: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      })

      // res.render('exchanges/index', {
      //   title: 'Exchanges',

      //   // @ts-ignore
      //   exchanges: rows,
      //   totalPages: 1,
      // })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Get exchange by ID
  async getById(req: Request, res: Response) {
    try {
      const exchange = await db.Exchange.findByPk(req.params.id, {
        include: [
          {
            model: db.Wallet,
            as: 'wallets',
          },
        ],
      })

      if (!exchange) {
        return res.status(404).json({ message: 'Exchange not found' })
      }

      return res.json(exchange)
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Update exchange
  async update(
    req: Request<{ id: string }, {}, UpdateExchangeInput>,
    res: Response
  ) {
    try {
      const exchange = await db.Exchange.findByPk(req.params.id)

      if (!exchange) {
        return res.status(404).json({ message: 'Exchange not found' })
      }

      await exchange.update(req.body)
      return res.json(exchange)
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          message: 'Exchange with this name or address already exists',
        })
      }
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  // Delete exchange
  async delete(req: Request, res: Response) {
    try {
      const exchange = await db.Exchange.findByPk(req.params.id)

      if (!exchange) {
        return res.status(404).json({ message: 'Exchange not found' })
      }

      await exchange.destroy()
      return res.status(204).send()
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' })
    }
  }
}
