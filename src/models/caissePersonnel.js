module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CaissePersonnel', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_caisse: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_personnel: {
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