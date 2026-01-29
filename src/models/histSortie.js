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
        id_probal: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        receveur: { // celui qui recois 
            type: DataTypes.TEXT,
            allowNull: false
        },
        commantaire: { // celui qui recois 
            type: DataTypes.TEXT,
            allowNull: true
        },
    },
    {
        timestamps: true,
        createdAt: 'created',
        updatedAt: false
    })
}