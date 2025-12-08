module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CaisseJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            //autoIncrement: true
        },
        recette: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        depense: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        origine_fond: {
            type: DataTypes.TEXT,
            allowNull: true
        }, 
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        commentaire: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}