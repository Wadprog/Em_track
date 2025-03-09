/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize'

interface WalletAttributes {
  id: number
  address: string
  exchangeId: number
  initialBalance: number
}
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      // Wallet.belongsTo(models.Exchange, {
      //   foreignKey: 'exchangeId',
      //   onDelete: 'NO ACTION',
      // });
      // Wallet.hasMany(models.Coin, {
      //   foreignKey: 'walletId',
      //   onDelete: 'NO ACTION',
      // });
      // Wallet.hasMany(models.Transaction, {
      //   foreignKey: 'walletId',
      //   onDelete: 'NO ACTION',
      // });
    }
  }
  Wallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      exchangeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'exchanges',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      initialBalance: {
        type: DataTypes.DECIMAL(20, 10),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Wallet',
      underscored: true,
      tableName: 'wallets',
    }
  )
  return Wallet
}
