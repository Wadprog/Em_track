import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import { Application } from 'express'

dotenv.config()

const dbUrl = process.env.DATABASE_URL

const config = {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true, // Use snake_case for fields
    timestamps: true, // Add timestamps
  },
}

let sequelize: Sequelize

if (dbUrl) {
  // @ts-ignore
  sequelize = new Sequelize(dbUrl, config)
} else {
  // @ts-ignore
  sequelize = new Sequelize({
    ...config,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'em',
    username: process.env.DB_USER || 'em',
    password: process.env.DB_PASSWORD || 'em',
  })
}

export const testConnection = async () => {

  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

export default sequelize
