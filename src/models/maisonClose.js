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
        // nb_employer: {
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        nb_chambre: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}