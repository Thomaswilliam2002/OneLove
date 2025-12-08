module.exports = (sequelize, DataTypes) => {
    return sequelize.define('BarSimpleJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        recette: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        depense: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}