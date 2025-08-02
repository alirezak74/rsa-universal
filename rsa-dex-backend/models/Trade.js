const { sequelize, DataTypes } = require('./index');

const Trade = sequelize.define('Trade', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  buyOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sellOrderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pair: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = Trade; 