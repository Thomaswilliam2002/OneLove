module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Poste', {
        id_poste: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom_poste: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salaire: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        // sous_depart: { 
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        // departement: {
        //     type: DataTypes.STRING,
        //     allowNull: true
        // },
        description: {
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