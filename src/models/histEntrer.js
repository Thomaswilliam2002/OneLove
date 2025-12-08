module.exports = (sequelize, DataTypes) => {
    return sequelize.define('HistEntrer', {
        id_hist: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantiter: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        prix_unit: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_probal: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        donneur: { // celui qui fais rentrer
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}