module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CuisineJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        montant_verser: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        comentaire: {
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