module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Chambre', {
        id_chambre: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        loyer: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        disponibiliter: {
            type: DataTypes.STRING,
            allowNull: false
        },
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