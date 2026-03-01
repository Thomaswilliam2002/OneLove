module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Depense', {
        id_depense: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        montant: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}