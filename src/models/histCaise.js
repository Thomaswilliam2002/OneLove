module.exports = (sequelize, DataTypes) => {
    return sequelize.define('HistCaisse', {
        id_hist: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantiter: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        prix_unit: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_probal: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_caisse: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nomBarClub: {
            type: DataTypes.STRING,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: true //false
        },
        id_caissier: {
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