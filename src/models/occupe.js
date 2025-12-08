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
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}