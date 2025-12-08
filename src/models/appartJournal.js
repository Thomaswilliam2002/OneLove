module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AppartJournal', {
        id_journal: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date_debut: {
            type: DataTypes.DATE,
            allowNull: false
        },
        date_fin: {
            type: DataTypes.DATE,
            allowNull: false
        },
        loyer: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        nuiter: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        motif: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        commentaire: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        id_client: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}