/* eslint-disable import/no-import-module-exports */
import { Model } from 'sequelize'

interface ExchangeAttributes {
  id: number
  name: string
  address: string
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Exchange extends Model<ExchangeAttributes> {
    static associate(models: any) {
      // Exchange.hasMany(models.Wallets, {
      //   foreignKey: 'exchangeId',
      // })
    }
  }

  Exchange.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Exchange',
      underscored: true,
      tableName: 'exchanges',
    }
  )

  return Exchange
}
