module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      exchange_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exchanges',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      initial_balance: {
        type: Sequelize.DECIMAL(20, 10),
        allowNull: false,
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
    await queryInterface.dropTable('wallets')
  },
}
