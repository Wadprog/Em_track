const express = require('express')
const router = express.Router()
const { Transaction, Wallet, Token, Exchange } = require('../models')
const { check, validationResult } = require('express-validator')

// Validation middleware
const validateTransaction = [
  check('wallet_from_id').isInt().withMessage('Source wallet is required'),
  check('wallet_to_id').isInt().withMessage('Destination wallet is required'),
  check('token_id').isInt().withMessage('Token is required'),
  check('amount')
    .isFloat({ min: 0.000000001 })
    .withMessage('Amount must be greater than 0'),
]

// Index - GET /transactions
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const offset = (page - 1) * limit

    // Build filter conditions
    const where = {}
    if (req.query.source_wallet) where.wallet_from_id = req.query.source_wallet
    if (req.query.destination_wallet)
      where.wallet_to_id = req.query.destination_wallet
    if (req.query.token) where.token_id = req.query.token
    if (req.query.min_amount)
      where.amount = { [Op.gte]: parseFloat(req.query.min_amount) }
    if (req.query.max_amount)
      where.amount = {
        ...where.amount,
        [Op.lte]: parseFloat(req.query.max_amount),
      }

    // Fetch transactions with pagination
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
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
        { model: Token },
      ],
      order: [['createdAt', 'DESC']],
    })

    // Fetch all wallets and tokens for filters
    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })
    const tokens = await Token.findAll({
      order: [['mint', 'ASC']],
    })

    res.render('transactions/index', {
      transactions,
      wallets,
      tokens,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      query: req.query,
    })
  } catch (error) {
    req.flash('error', 'Error loading transactions: ' + error.message)
    res.redirect('/')
  }
})

// New - GET /transactions/new
router.get('/new', async (req, res) => {
  try {
    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })
    const tokens = await Token.findAll({
      order: [['mint', 'ASC']],
    })

    res.render('transactions/form', {
      transaction: null,
      wallets,
      tokens,
      preselectedFromWallet: req.query.wallet_from_id,
      preselectedToWallet: req.query.wallet_to_id,
      preselectedToken: req.query.token_id,
    })
  } catch (error) {
    req.flash('error', 'Error loading transaction form: ' + error.message)
    res.redirect('/transactions')
  }
})

// Create - POST /transactions
router.post('/', validateTransaction, async (req, res) => {
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
      return res.redirect('/transactions/new')
    }

    const transaction = await Transaction.create(req.body)
    req.flash('success', 'Transaction created successfully')
    res.redirect(`/transactions/${transaction.id}`)
  } catch (error) {
    req.flash('error', 'Error creating transaction: ' + error.message)
    res.redirect('/transactions/new')
  }
})

// Show - GET /transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
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
        { model: Token },
      ],
    })

    if (!transaction) {
      req.flash('error', 'Transaction not found')
      return res.redirect('/transactions')
    }

    res.render('transactions/show', { transaction })
  } catch (error) {
    req.flash('error', 'Error loading transaction: ' + error.message)
    res.redirect('/transactions')
  }
})

// Edit - GET /transactions/:id/edit
router.get('/:id/edit', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id)
    if (!transaction) {
      req.flash('error', 'Transaction not found')
      return res.redirect('/transactions')
    }

    const wallets = await Wallet.findAll({
      include: [{ model: Exchange }],
      order: [['address', 'ASC']],
    })
    const tokens = await Token.findAll({
      order: [['mint', 'ASC']],
    })

    res.render('transactions/form', {
      transaction,
      wallets,
      tokens,
    })
  } catch (error) {
    req.flash('error', 'Error loading transaction form: ' + error.message)
    res.redirect('/transactions')
  }
})

// Update - PUT /transactions/:id
router.put('/:id', validateTransaction, async (req, res) => {
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
      return res.redirect(`/transactions/${req.params.id}/edit`)
    }

    const transaction = await Transaction.findByPk(req.params.id)
    if (!transaction) {
      req.flash('error', 'Transaction not found')
      return res.redirect('/transactions')
    }

    await transaction.update(req.body)
    req.flash('success', 'Transaction updated successfully')
    res.redirect(`/transactions/${transaction.id}`)
  } catch (error) {
    req.flash('error', 'Error updating transaction: ' + error.message)
    res.redirect(`/transactions/${req.params.id}/edit`)
  }
})

// Delete - DELETE /transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id)
    if (!transaction) {
      req.flash('error', 'Transaction not found')
      return res.redirect('/transactions')
    }

    await transaction.destroy()
    req.flash('success', 'Transaction deleted successfully')
    res.redirect('/transactions')
  } catch (error) {
    req.flash('error', 'Error deleting transaction: ' + error.message)
    res.redirect('/transactions')
  }
})

module.exports = router
