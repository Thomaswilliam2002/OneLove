module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Caisse', {
        id_caisse: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        solde: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        recette: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        depense: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        id_employer: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        caisse_of: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}