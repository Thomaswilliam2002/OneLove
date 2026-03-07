module.exports = (sequelize, DataTypes) => {
    return sequelize.define('MaisonClose', {
        id_mclose: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: true
        },
        adresse: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        nb_chambre: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}