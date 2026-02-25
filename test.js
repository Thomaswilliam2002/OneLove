console.log(process.env.PORT)
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql', //'mariadb',
        dialectModule: require('mysql2'), // Optionnel mais conseillé pour éviter des erreurs au déploiement
        port: process.env.DB_PORT || 3306
    }
)