module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ChambreJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        loyer: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        motif: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
        ,
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