module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Occupe', {
        id_occupe: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        salaire: {
            type: DataTypes.FLOAT,
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