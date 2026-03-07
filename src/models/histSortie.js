module.exports = (sequelize, DataTypes) => {
    return sequelize.define('HistSortie', {
        id_hist: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantiter: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        prix_unit: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_caisse: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_probal: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        receveur: { // celui qui recois 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type_lieu_receveur:{
            type: DataTypes.STRING,
            allowNull: false
        },
        commantaire: { // celui qui recois 
            type: DataTypes.TEXT,
            allowNull: true
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