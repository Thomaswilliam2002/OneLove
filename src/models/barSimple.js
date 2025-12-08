module.exports = (sequelize, DataTypes) => {
    return sequelize.define('BarSimple', {
        id_barSimple: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adresse: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        // superficie: {
        //     type: DataTypes.FLOAT,
        //     allowNull: true
        // },
        // capaciter: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true
        // },
        // nb_employer: {
        //     type: DataTypes.INTEGER,
        //     allowNull: true
        // },
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}