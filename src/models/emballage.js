module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Emballage', {
        id_emballage: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        quantiter: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        seuil: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        id_categ: {
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