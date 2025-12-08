module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Occupent', {
        id_occup: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_prenom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numero: {
            type: DataTypes.STRING,
            allowNull: true
        },
        id_mclose: {
            type: DataTypes.STRING,
            allowNull: true
        },
        id_chambre: {
            type: DataTypes.STRING,
            allowNull: true
        }, 
        date_arriver: {
            type: DataTypes.DATE,
            allowNull: true
        }, 
        date_depart: {
            type: DataTypes.DATE,
            allowNull: true
        },
        commentaire: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}