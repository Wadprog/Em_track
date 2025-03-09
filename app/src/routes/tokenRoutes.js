const express = require('express')
const router = express.Router()
const { Token, Wallet, Exchange, Transaction } = require('../models')
const { check, validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Validation middleware
const validateToken = [
  check('mint')
    .notEmpty()
    .withMessage('Mint address is required')
    .trim()
    .toUpperCase(),
  check('wallet_id').isInt().withMessage('Wallet is required'),
  check('origin')
    .isIn(['minted', 'imported'])
    .withMessage('Origin must be either minted or imported'),
  check('metadata_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('Metadata URL must be a valid URL'),
]

// Index - GET /tokens
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const offset = (page - 1) * limit

    // Build filter conditions
    const where = {}
    if (req.query.wallet) where.wallet_id = req.query.wallet
    if (req.query.origin) where.origin = req.query.origin
    if (req.query.search) {
      where.mint = {
        [Op.iLike]: `%${req.query.search}%`,
      }
    }

    // Fetch tokens with pagination
    const { count, rows: tokens } = await Token.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: Wallet,
          include: [{ model: Exchange }],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    // Fetch all wallets for the filter dropdown
    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })

    res.render('tokens/index', {
      tokens,
      wallets,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    })
  } catch (error) {
    req.flash('error', 'Error loading tokens: ' + error.message)
    res.redirect('/')
  }
})

// New - GET /tokens/new
router.get('/new', async (req, res) => {
  try {
    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })

    res.render('tokens/form', {
      token: null,
      wallets,
      preselectedWallet: req.query.wallet_id,
    })
  } catch (error) {
    req.flash('error', 'Error loading token form: ' + error.message)
    res.redirect('/tokens')
  }
})

// Create - POST /tokens
router.post('/', validateToken, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash(
        'error',
        errors
          .array()
          .map((e) => e.msg)
          .join(', ')
      )
      return res.redirect('/tokens/new')
    }

    // Check if token with same mint address already exists
    const existingToken = await Token.findOne({
      where: { mint: req.body.mint },
    })

    if (existingToken) {
      req.flash('error', 'A token with this mint address already exists')
      return res.redirect('/tokens/new')
    }

    const token = await Token.create(req.body)
    req.flash('success', 'Token created successfully')
    res.redirect(`/tokens/${token.id}`)
  } catch (error) {
    req.flash('error', 'Error creating token: ' + error.message)
    res.redirect('/tokens/new')
  }
})

// Show - GET /tokens/:id
router.get('/:id', async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id, {
      include: [
        {
          model: Wallet,
          include: [{ model: Exchange }],
        },
      ],
    })

    if (!token) {
      req.flash('error', 'Token not found')
      return res.redirect('/tokens')
    }

    // Fetch recent transactions for this token
    const transactions = await Transaction.findAll({
      where: { token_id: token.id },
      include: [
        {
          model: Wallet,
          as: 'sourceWallet',
          include: [{ model: Exchange }],
        },
        {
          model: Wallet,
          as: 'destinationWallet',
          include: [{ model: Exchange }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    })

    res.render('tokens/show', { token, transactions })
  } catch (error) {
    req.flash('error', 'Error loading token: ' + error.message)
    res.redirect('/tokens')
  }
})

// Edit - GET /tokens/:id/edit
router.get('/:id/edit', async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id)
    if (!token) {
      req.flash('error', 'Token not found')
      return res.redirect('/tokens')
    }

    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })

    res.render('tokens/form', {
      token,
      wallets,
    })
  } catch (error) {
    req.flash('error', 'Error loading token form: ' + error.message)
    res.redirect('/tokens')
  }
})

// Update - PUT /tokens/:id
router.put('/:id', validateToken, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash(
        'error',
        errors
          .array()
          .map((e) => e.msg)
          .join(', ')
      )
      return res.redirect(`/tokens/${req.params.id}/edit`)
    }

    const token = await Token.findByPk(req.params.id)
    if (!token) {
      req.flash('error', 'Token not found')
      return res.redirect('/tokens')
    }

    // Check if another token with the same mint address exists
    if (token.mint !== req.body.mint) {
      const existingToken = await Token.findOne({
        where: { mint: req.body.mint },
      })

      if (existingToken) {
        req.flash('error', 'A token with this mint address already exists')
        return res.redirect(`/tokens/${req.params.id}/edit`)
      }
    }

    await token.update(req.body)
    req.flash('success', 'Token updated successfully')
    res.redirect(`/tokens/${token.id}`)
  } catch (error) {
    req.flash('error', 'Error updating token: ' + error.message)
    res.redirect(`/tokens/${req.params.id}/edit`)
  }
})

// Delete - DELETE /tokens/:id
router.delete('/:id', async (req, res) => {
  try {
    const token = await Token.findByPk(req.params.id)
    if (!token) {
      req.flash('error', 'Token not found')
      return res.redirect('/tokens')
    }

    // Check if token has any associated transactions
    const transactionCount = await Transaction.count({
      where: { token_id: token.id },
    })

    if (transactionCount > 0) {
      req.flash('error', 'Cannot delete token with associated transactions')
      return res.redirect(`/tokens/${token.id}`)
    }

    await token.destroy()
    req.flash('success', 'Token deleted successfully')
    res.redirect('/tokens')
  } catch (error) {
    req.flash('error', 'Error deleting token: ' + error.message)
    res.redirect('/tokens')
  }
})

module.exports = router
