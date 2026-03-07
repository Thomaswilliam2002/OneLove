module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Appartement', {
        id_appart: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_appart: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prix_appart: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        adresse_appart: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        desc_appart: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        dispo_appart: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
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