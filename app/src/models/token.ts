/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize'

interface TokenAttributes {
  id: number
  mint: string
  walletId: number
  origin: 'minted' | 'migrated'
}

module.exports = (sequelize, DataTypes) => {
  class Token extends Model<TokenAttributes> {
    static associate(models) {
      Token.hasMany(models.PriceIndex, {
        foreignKey: 'tokenId',
        as: 'priceIndex',
      })

      Token.belongsTo(models.Wallet, {
        foreignKey: 'walletId',
        onDelete: 'NO ACTION',
      })

      // Token.hasMany(models.Transaction);
    }
  }

  Token.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mint: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'wallets',
          key: 'id',
        },
      },
      origin: {
        type: DataTypes.ENUM('minted', 'migrated'),
        defaultValue: 'minted',
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Token',
      underscored: true,
      tableName: 'tokens',
      validate: {
        walletIdConstraint() {
          if (this.origin === 'migrated' && this.walletId !== null) {
            throw new Error('Wallet ID must be null for migrated tokens')
          }
          if (this.origin === 'minted' && this.walletId === null) {
            throw new Error('Wallet ID is required for minted tokens')
          }
        },
      },
    }
  )
  return Token
}
