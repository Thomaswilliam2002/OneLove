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
        // photo_appart: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        // type_appart: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        desc_appart: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        dispo_appart: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // status: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}