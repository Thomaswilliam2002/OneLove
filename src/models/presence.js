module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Presence', {
        id_presence: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        heure_arriver: {
            type: DataTypes.TIME,
            allowNull: false
        },
        heure_deppart: {
            type: DataTypes.TIME,
            allowNull: false
        },
        justification_absence: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        etat_presence: { // present absent retard
            type: DataTypes.STRING,
            allowNull: false
        },
        depart_enticiper: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pointeur: {
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