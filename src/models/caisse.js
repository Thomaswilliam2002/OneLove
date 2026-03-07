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
        nom_lieu: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type_lieu: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_lieu: {
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