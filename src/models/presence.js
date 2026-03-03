module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Presence', {
        id_presence: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        date_debut: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        date_fin: {
            type: DataTypes.DATEONLY,
            allowNull: true // Modifié : peut être nul au début
        },
        heure_arriver: {
            type: DataTypes.TIME,
            allowNull: true // Modifié : nul si c'est une absence
        },
        heure_deppart: {
            type: DataTypes.TIME,
            allowNull: true // Modifié : nul tant qu'il n'est pas parti
        },
        justification_absence: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        etat_presence: { // Present, Absent
            type: DataTypes.STRING,
            allowNull: false
        },
        depart_enticiper: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'non'
        },
        id_personnel: { // Clé étrangère vers l'employé
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pointeur: { // ID de l'admin qui fait l'action
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated'
    })
}