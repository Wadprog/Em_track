import { Model, Sequelize, DataTypes } from 'sequelize'

interface PriceIndexAttributes {
  id: number
  tokenId: number
  amount: number
  timestamp: Date
}

module.exports = (sequelize: Sequelize) => {
  class PriceIndex extends Model<PriceIndexAttributes> {
    static associate(models: any) {
      // Define association here
      PriceIndex.belongsTo(models.Token, {
        foreignKey: 'tokenId',
        as: 'token',
      })
    }
  }

  PriceIndex.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tokenId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tokens', // This should match your Token table name
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.DECIMAL(24, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'PriceIndex',
      tableName: 'price_index',
      timestamps: false,
      underscored: true,
    }
  )

  return PriceIndex
}
