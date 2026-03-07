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
            type: DataTypes.DATEONLY,
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