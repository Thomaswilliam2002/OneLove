module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Personnel', {
        id_personnel: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adresse: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mdp: {
            type: DataTypes.STRING,
            allowNull: false
        },
        numero: {
            type: DataTypes.STRING,
            allowNull: false
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        genre: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type_personnel: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        validation: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        periode:{
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}