module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AppartFondJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_appart: {
            type: DataTypes.INTEGER,
            allowNull: false
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