module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Cuisine', {
        id_cuisine: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_cuisine: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nom_locataire: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom_locataire: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adresse_locataire: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        email_locataire: {
            type: DataTypes.STRING,
            allowNull: true
        },
        numero_locataire: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // motif: {
        //     type: DataTypes.TEXT,
        //     allowNull: true
        // },
        description: {
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