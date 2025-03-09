/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
/* eslint-disable import/no-import-module-exports */


import { Model } from 'sequelize'

interface TransactionInterface {
  id: number,
  walletFromId: number,
  walletToId: number,
  amount: number,
  tokenId: string,

}
module.exports = (sequelize: any, DataTypes: any) => {
  class Transaction extends Model<TransactionInterface> {
    static associate(models: any): void {
      // Transaction.belongsTo(models.Profile)
      // Transaction.belongsTo(models.Page)
      // Transaction.belongsTo(models.Comment)
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      walletFromId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      walletToId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 10),
        allowNull: false,
      },
      tokenId: {
        type: DataTypes.STRING,
        allowNull: false,
    }
    },
    {
      sequelize,
      modelName: 'Transaction',
      tableName: 'transactions',
      underscored: true,
    }
  )
  return Transaction
}
