module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Sanction', {
        id_sanction: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        motif: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        montan_defalquer: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        date: {
            type: DataTypes.DATEONLY,
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