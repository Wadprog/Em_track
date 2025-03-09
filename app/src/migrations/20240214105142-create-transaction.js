module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wallet_from_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      wallet_to_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'wallets',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      amount: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull: false,
      },
      token_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'tokens',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions')
  },
}
