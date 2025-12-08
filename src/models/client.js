module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Client', {
        id_client: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_client: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom_client: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numero_client: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        comentaire_client: {
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