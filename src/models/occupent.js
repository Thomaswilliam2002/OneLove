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
            type: DataTypes.INTEGER,
            allowNull: true
        },
        id_chambre: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, 
        date_arriver: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }, 
        date_depart: {
            type: DataTypes.DATE,
            allowNull: true
        },
        commentaire: {
            type: DataTypes.TEXT,
            allowNull: true
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