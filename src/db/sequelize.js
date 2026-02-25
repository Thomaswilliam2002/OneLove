const {Sequelize, DataTypes,Op} = require('sequelize');
const bcrypt = require('bcrypt')
require('dotenv').config();

const Appartement_m = require('../models/appartement')
const AppartJournal_m = require('../models/appartJournal')
const BarSimple_m = require('../models/barSimple')
const BarSimpleJournal_m = require('../models/barSimpleJournal')
const BarVip_m = require('../models/barVip');
const BarVipJournal_m = require('../models/barVipJournal');
const Caisse_m = require('../models/caisse');
const CaisseJournal_m = require('../models/caisseJournal');
const Chambre_m = require('../models/chambre');
const ChambreJournal_m = require('../models/chambreJournal');
const CrazyClub_m = require('../models/crazyClub');
const CrazyClubJournal_m = require('../models/cclubJournal');
const Cuisine_m = require('../models/cuisine');
const CuisineJournal_m = require('../models/cuisineJournal');
const MaisonColse_m = require('../models/maisonClose');
const Personnel_m = require('../models/personnel');
const Poste_m = require('../models/poste');
const Sanction_m = require('../models/sanction');
const Client_m = require('../models/client')
const Occupe_m = require('../models/occupe')
const Categorie_m = require('../models/categorie')
const Produit_m = require('../models/produit')
const Emballage_m = require('../models/emballage')
const HistEntrer_m = require('../models/histEntrer')
const HistSortie_m = require('../models/histSortie')
const Presence_m = require('../models/presence')
const Occupent_m = require('../models/occupent')
const AppartFondJournal_m = require('../models/appartFondJournal');
const HistCaisse_m = require('../models/histCaise');
const occupe = require('../models/occupe');

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASS,
//     {
//         host: process.env.DB_HOST || 'localhost',
//         dialect: 'mysql', //'mariadb',
//         dialectModule: require('mysql2'), // Optionnel mais conseillé pour éviter des erreurs au déploiement
//         port: process.env.DB_PORT || 3306
//     }
// )

// On utilise l'URL de Render (DATABASE_URL)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Indispensable pour que Render accepte la connexion
      }
    }
});

const Appartement = Appartement_m(sequelize, DataTypes);
const AppartJournal = AppartJournal_m(sequelize, DataTypes);
const BarSimple = BarSimple_m(sequelize, DataTypes);
const BarSimpleJournal = BarSimpleJournal_m(sequelize, DataTypes);
const BarVip = BarVip_m(sequelize, DataTypes);
const BarVipJournal = BarVipJournal_m(sequelize, DataTypes);
const Caisse = Caisse_m(sequelize, DataTypes);
const CaisseJournal = CaisseJournal_m(sequelize, DataTypes);
const Chambre = Chambre_m(sequelize, DataTypes);
const ChambreJournal = ChambreJournal_m(sequelize, DataTypes);
const CrazyClub = CrazyClub_m(sequelize, DataTypes);
const CrazyClubJournal = CrazyClubJournal_m(sequelize, DataTypes);
const Cuisine = Cuisine_m(sequelize, DataTypes);
const CuisineJournal = CuisineJournal_m(sequelize, DataTypes);
const MaisonColse = MaisonColse_m(sequelize, DataTypes);
const Personnel = Personnel_m(sequelize, DataTypes);
const Poste = Poste_m(sequelize, DataTypes);
const Sanction = Sanction_m(sequelize, DataTypes);
const Client = Client_m(sequelize, DataTypes);
const Occupe = Occupe_m(sequelize, DataTypes);
const Categorie = Categorie_m(sequelize, DataTypes);
const Produit = Produit_m(sequelize, DataTypes);
const Emballage = Emballage_m(sequelize, DataTypes);
const HistEntrer = HistEntrer_m(sequelize, DataTypes);
const HistSortie = HistSortie_m(sequelize, DataTypes);
const Presence = Presence_m(sequelize, DataTypes);
const Occupent = Occupent_m(sequelize, DataTypes);
const AppartFondJournal = AppartFondJournal_m(sequelize, DataTypes);
const HistCaisse = HistCaisse_m(sequelize, DataTypes);

sequelize.authenticate()
    .then(_ => console.log("Connexion reussi avec la bd"))
    .catch(err => console.log('erreur: ' + err))


//creation des relation entre les table

// liaison entre bar simple et son journal
BarSimple.hasMany(BarSimpleJournal, {
    foreignKey: 'id_barSimple'
});
BarSimpleJournal.belongsTo(BarSimple, {
    foreignKey: 'id_barSimple'
});

// liaison entre appartement et son journal
Appartement.hasMany(AppartJournal, {
    foreignKey: 'id_appart'
});
AppartJournal.belongsTo(Appartement, {
    foreignKey: 'id_appart'
});

// liaison entre appartement et appart font journal
Appartement.hasMany(AppartFondJournal, {
    foreignKey: 'id_appart'
});
AppartFondJournal.belongsTo(Appartement, {
    foreignKey: 'id_appart'
});
// liaison entre appartement et son journal
// Appartement.hasMany(AppartFondJournal, {
//     foreignKey: 'id_appart'
// });
// AppartFondJournal.belongsTo(Appartement, {
//     foreignKey: 'id_appart'
// });

// liaison entre client et Appartement
// Appartement.hasMany(Client, {
//     foreignKey: 'id_chambre'
// });
// Client.belongsTo(Appartement, {
//     foreignKey: 'id_chambre'
// });

// liaison entre client et son journal
// Client.hasMany(AppartJournal, {
//     foreignKey: 'id_client'
// });
// AppartJournal.belongsTo(Client, {
//     foreignKey: 'id_client'
// });

// liaison entre bar vip et son journal
BarVip.hasMany(BarVipJournal, {
    foreignKey: 'id_barVip'
});
BarVipJournal.belongsTo(BarVip, {
    foreignKey: 'id_barVip'
});

CrazyClub.hasMany(CrazyClubJournal, {
    foreignKey: 'id_cclub'
});
CrazyClubJournal.belongsTo(CrazyClub, {
    foreignKey: 'id_cclub'
});

// liaison entre bar cuisine et son journal
Cuisine.hasMany(CuisineJournal, {
    foreignKey: 'id_cuisine'
});
CuisineJournal.belongsTo(Cuisine, {
    foreignKey: 'id_cuisine'
});

// liaison entre maison close et chambre
MaisonColse.hasMany(Chambre, {
    foreignKey: 'id_mclose'
});
Chambre.belongsTo(MaisonColse, {
    foreignKey: 'id_mclose'
});

// liaison entre chambre et son journal
Chambre.hasMany(ChambreJournal, {
    foreignKey: 'id_chambre'
});
ChambreJournal.belongsTo(Chambre, {
    foreignKey: 'id_chambre'
});

// liaison entre maison close et journal chambre
MaisonColse.hasMany(ChambreJournal, {
    foreignKey: 'id_mclose'
});
ChambreJournal.belongsTo(MaisonColse, {
    foreignKey: 'id_mclose'
});

// liaison entre caisse et son journal
Caisse.hasMany(CaisseJournal, {
    foreignKey: 'id_caisse'
});
CaisseJournal.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre caisse et bar simple
Caisse.hasMany(BarSimple, {
    foreignKey: 'id_caisse'
});
BarSimple.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre caisse et appartement
Caisse.hasMany(Appartement, {
    foreignKey: 'id_caisse'
});
Appartement.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre caisse et bar vip
Caisse.hasMany(BarVip, {
    foreignKey: 'id_caisse'
});
BarVip.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre caisse et cuisine
Caisse.hasMany(Cuisine, {
    foreignKey: 'id_caisse'
});
Cuisine.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre caisse et maison close
Caisse.hasMany(MaisonColse, {
    foreignKey: 'id_caisse'
});
MaisonColse.belongsTo(Caisse, {
    foreignKey: 'id_caisse'
});

// liaison entre personnel et occupe
Personnel.hasMany(Occupe, {
    foreignKey: 'id_personnel'
});
Occupe.belongsTo(Personnel, {
    foreignKey: 'id_personnel'
});

// liaison entre personnel et presence
Personnel.hasMany(Presence, {
    foreignKey: 'id_personnel'
});
Presence.belongsTo(Personnel, {
    foreignKey: 'id_personnel'
});

// liaison entre occupe et poste
Poste.hasMany(Occupe, {
    foreignKey: 'id_poste'
});
Occupe.belongsTo(Poste, {
    foreignKey: 'id_poste'
});


// liaison entre occupe et sanction
Occupe.hasMany(Sanction, {
    foreignKey: 'id_occupe'
});
Sanction.belongsTo(Occupe, {
    foreignKey: 'id_occupe'
});

// liaison entre Categorie et Produit
// Categorie.hasMany(Produit, {
//     foreignKey: 'id_categ'
// });
// Produit.belongsTo(Categorie, {
//     foreignKey: 'id_categ'
// });

// liaison entre article et histAchatArticle
// Produit.hasMany(HistEntrer, {
//     foreignKey: 'id_produit'
// });
// HistEntrer.belongsTo(Produit, {
//     foreignKey: 'id_produit'
// });

// liaison entre article et histVenteArticle
// Produit.hasMany(HistSortie, {
//     foreignKey: 'id_produit'
// });
// HistSortie.belongsTo(Produit, {
//     foreignKey: 'id_produit'
// });

(async () =>{
    try{
        await sequelize.sync(); //{alter: false}
        console.log('Base synchronisee')

        const count = await Poste.count({
            where:{
                nom_poste: {
                    [Op.in]: ['Admin', 'Comptable', 'Caissier']
                }
            }
        })

        const admin = await Personnel.findAll({
            where:{
                type_personnel: 'admin'
            }
        })

        //console.log(count)
        if(count === 0){
            try{
                const insert = await Poste.bulkCreate([
                    {nom_poste: 'Admin', salaire: 0, description: 'Administrateur de One Love'},
                    {nom_poste: 'Comptable', salaire: 0, description: 'Comptable de One Love'},
                    {nom_poste: 'Caissier Central', salaire: 0, description: ''},
                    {nom_poste: 'Caissier', salaire: 0, description: ''},
                    {nom_poste: 'Gerant', salaire: 0, description: ''}
                ])
            }catch (e){
                console.log(e)
            }
        }

        if(!admin || admin.length === 0){
            try{
                const salt = await bcrypt.genSalt(10);
                const hash_pass = await bcrypt.hash('adminadmin', salt)
                Personnel.create({
                    nom: 'admin', 
                    prenom: 'admin',
                    adresse: '',
                    email: 'admin@gmail.com',
                    mdp: hash_pass,
                    numero: '',
                    age: 0,
                    genre: '',
                    type_personnel: 'admin',
                    description: '',
                    validation: true,
                    periode: 'Mensuel'
                })

                Occupe.create(
                    {salaire:0,
                    id_personnel: 1,
                    id_poste: 1}
                )
            }catch (e){
                console.log(e)
            }
        }

    }catch (e){
        console.log(e)
    }
})();
// sequelize.sync({alter: false})
//     .then(_ => console.log('Base synchronisee'))
//     .catch(err => console.log('Erreur ' + err))

// const count = Poste.count({
//     where:{
//         nom_poste: {
//             [Op.in]: ['Admin', 'Comptable', 'Caissier']
//         }
//     }
// })
//     .then(count => {
//         console.log(count)
//         if(count === 0){
//             Poste.create({
//                 nom_poste: 'Admin',
//                 salaire: 0,
//                 description: ''
//             })
//                 .then(poste => {
//                     console.log('cree')
//                 })
//                 .catch(_ => console.log('erreure de ajout', _))
//         }
//     })
//     .catch(_ => console.log('erreure de count', _))

module.exports = {
    sequelize,
    Appartement,
    AppartJournal,
    BarSimple,
    BarSimpleJournal,
    BarVip,
    BarVipJournal,
    Caisse,
    CaisseJournal,
    Chambre,
    ChambreJournal,
    CrazyClub,
    CrazyClubJournal,
    Cuisine,
    CuisineJournal,
    MaisonColse,
    Personnel,
    Poste,
    Sanction,
    Client,
    Occupe,
    Categorie,
    Produit,
    Emballage,
    HistEntrer,
    HistSortie,
    Presence,
    Occupent,
    AppartFondJournal,
    HistCaisse
}