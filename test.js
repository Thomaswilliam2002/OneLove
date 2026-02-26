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

// remplace DATE_FORMAT par TO_CHAR
// MySQL utilise DATE_FORMAT().
// PostgreSQL (celui de Render) utilise TO_CHAR().

oneProduit = (app) => {
    app.get('/oneProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findByPk(req.params.id)
            .then(produit => {
                if (!produit) return res.redirect('/notFound');

                // 1. Récupérer l'historique des entrées groupé par mois
                const pEntree = HistEntrer.findAll({
                    attributes: [
                        [fn('TO_CHAR', col('created'), 'YYYY-MM'), 'mois'],
                        'id_probal',
                        [fn('SUM', literal('quantiter * prix_unit')), 'total_recette']
                    ],
                    where: { id_probal: produit.id_produit, type: 'produit' },
                    group: [
                        fn('TO_CHAR', col('created'), 'YYYY-MM'), 
                        'id_probal', 
                        'id_hist' // Obligatoire pour PostgreSQL car c'est la clé primaire
                    ],
                    raw: true
                });

                // 2. Récupérer l'historique des sorties groupé par mois
                const pSortie = HistSortie.findAll({
                    attributes: [
                        [fn('TO_CHAR', col('created'), 'YYYY-MM'), 'mois'],
                        'id_probal',
                        [fn('SUM', literal('quantiter * prix_unit')), 'recette']
                    ],
                    where: { id_probal: produit.id_produit, type: 'produit' },
                    group: [
                        fn('TO_CHAR', col('created'), 'YYYY-MM'), 
                        'id_probal', 
                        'id_hist' // Obligatoire pour PostgreSQL
                    ],
                    raw: true
                });

                // 3. Exécuter les requêtes et rendre la vue
                Promise.all([pEntree, pSortie])
                    .then(([hr, hs]) => {
                        res.status(200).render('produit-detail', {
                            histe: hr, 
                            hists: hs, 
                            produit: produit, 
                            hachats: hr, // Utilisation des données groupées
                            hventes: hs, 
                            msg: req.query.msg, 
                            type: req.query.type
                        });
                    })
                    .catch(error => {
                        console.error("Erreur SQL détaillée:", error);
                        res.redirect('/notFound');
                    });
            })
            .catch(error => {
                console.error(error);
                res.redirect('/notFound');
            });
    });
}

oneEmballage = (app) => {
    app.get('/oneEmballage/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Emballage.findByPk(req.params.id)
            .then(emballage => {
                HistEntrer.findAll({
                    where: {id_probal: emballage.id_emballage, type: 'emballage'}
                })
                    .then(hachats => {
                        HistSortie.findAll({
                            where: {id_probal: emballage.id_emballage, type: 'emballage'}
                        })
                            .then(hventes => {
                                HistEntrer.findAll({
                                    attributes:[
                                        [fn('TO_CHAR', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                        [literal("SUM(quantiter * prix_unit)"),'recette']],
                                        where: {
                                            id_probal: emballage.id_emballage, type: 'emballage'
                                        },
                                        group: [literal('mois')],
                                        order: [[literal('mois'), 'ASC']]
                                })
                                    .then(hr => {
                                        HistSortie.findAll({
                                            attributes:[
                                                [fn('TO_CHAR', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                                [literal("SUM(quantiter * prix_unit)"),'recette']],
                                                where: {
                                                    id_probal: emballage.id_emballage, type: 'emballage'
                                                },
                                                group: [literal('mois')],
                                                order: [[literal('mois'), 'ASC']]
                                        })
                                            .then(hs => {
                                                res.status(200).render('emballage-detail', {histe: hr, hists: hs, emballage: emballage, hachats: hachats, hventes: hventes, msg: req.query.msg, type: req.query.type})
                                            })
                                            .catch(_ => {
                                                console.error(_);
                                                res.redirect('/notFound');
                                                return; // On stoppe tout ici !
                                            })
                                    })
                                    .catch(_ => {
                                        console.error(_);
                                        res.redirect('/notFound');
                                        return; // On stoppe tout ici !
                                    })
                            })
                            .catch(_ => {
                                console.error(_);
                                res.redirect('/notFound');
                                return; // On stoppe tout ici !
                            })
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

app.get('/caisseOnelove', protrctionRoot, authorise('admin','comptable'), async (req, res) => {
    const all_recette = [];
    try{
        const fbs = await BarSimpleJournal.findAll({
            attributes:[
                [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                [fn('SUM', col('recette')),'total_recette']],
                group: ['mois'],
                order: [['mois', 'ASC']]
        });
        all_recette.push(fbs.map(row => row.toJSON()));
        if(fbs){
            try{
                const fbv = await BarVipJournal.findAll({
                    attributes:[
                        [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                        [fn('SUM', col('recette')),'total_recette']],
                        group: [literal('mois')],
                        order: [[literal('mois'), 'ASC']
                    ]
                });
                all_recette.push(fbv.map(row => row.toJSON()));
                if(fbv){
                    try{
                        const fap = await AppartFondJournal.findAll({
                            attributes:[
                                [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                                [fn('SUM', col('recette')),'total_recette']],
                                group: [literal('mois')],
                                order: [[literal('mois'), 'ASC']
                            ]
                        });
                        all_recette.push(fap.map(row => row.toJSON()));
                        if(fap){
                            try{
                                const fcui = await CuisineJournal.findAll({
                                    attributes:[
                                        [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                                        [fn('SUM', col('montant_verser')),'total_recette']],
                                        group: [literal('mois')],
                                        order: [[literal('mois'), 'ASC']
                                    ]
                                });
                                all_recette.push(fcui.map(row => row.toJSON()));
                                if(fcui){
                                    try{
                                        const fmc = await ChambreJournal.findAll({
                                            attributes:[
                                                [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                                                [fn('SUM', col('loyer')),'total_recette']],
                                                group: [literal('mois')],
                                                order: [[literal('mois'), 'ASC']
                                            ]
                                        });
                                        all_recette.push(fmc.map(row => row.toJSON()));
                                        if(fmc){
                                            const fcc = await CrazyClubJournal.findAll({
                                                attributes:[
                                                    [fn('TO_CHAR', col('date'), '%Y-%m'), 'mois'],
                                                    [fn('SUM', col('recette')),'total_recette']],
                                                    group: [literal('mois')],
                                                    order: [[literal('mois'), 'ASC']
                                                ]
                                            });
                                            all_recette.push(fcc.map(row => row.toJSON()));
                                           // const vall = JSON.stringify(all_recette)
                                            res.render('caisseOnelove', {all_recette})
                                        }else{
                                            console.log('erreur de calcul de la somme de fcm')
                                        }
                                    }catch(e){
                                        console.log(e)
                                    }
                                }else{
                                    console.log('erreur de calcul de la somme de fcui')
                                }
                            }catch(e){
                                console.log(e)
                            }
                        }else{
                            console.log('erreur de calcul de la somme de fap')
                        }
                    }catch(e){
                        console.log(e)
                    }
                }else{
                    console.log('erreur de calcul de la somme de fbv')
                    console.log(fbv)
                }
            }catch(e){
                console.log(e)
            }
        }else{
            console.log('erreur de calcul de la somme de fbs')
        }
    }catch(e){
        console.log(e)
    }
})
//===============================route:caise.js=========================================================
const {Caisse, BarSimpleJournal, BarVipJournal, AppartFondJournal, ChambreJournal, BarSimple, BarVip} = require('../../db/sequelize')
const {Poste, Appartement, MaisonColse, CrazyClub, CrazyClubJournal, HistCaisse, CuisineJournal} = require('../../db/sequelize')
const {Personnel} = require('../../db/sequelize')
const {Occupe} = require('../../db/sequelize')
const occupe = require('../../models/occupe')
const {fn, col, literal} = require('sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCaisse = (app) => {
    app.get('/allCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findAll({
            order:[['id_caisse', 'DESC']]
        })
            .then(caisses => {
                Personnel.findAll()
                    .then(personnels => {
                        // const msg = "Liste recuperer avec succes"
                        HistCaisse.findAll()
                         .then(histcaise => {
                            res.status(200).render('caisse-list', {caisses: caisses, personnels:personnels,histcaises: histcaise, msg: req.query.msg})
                         })
                         .catch(err => {
                            console.error(err);
                            res.redirect('/notFound');
                            return; // On stoppe tout ici !
                        })
                        //res.json({msg, data: caisses})
                    })
                    .catch(err => {
                        console.error(err);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(err => {
                console.error(err);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

caisseBareSimple = (app) => {
    app.get('/caisseBareSimple', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await BarSimpleJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 'id_barSimple', 
                    [fn('SUM', col('recette')),'total_recette'],
                    [col("BarSimple.nom"), "NomBar"]
                ],
                    include: [{
                        model: BarSimple,
                        attributes: [],
                    }],
                    group: ["mois", 'id_barSimple',"NomBar"],
                    order: [['id_barSimple','ASC']],
                    row:true
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseBareSimple', {all_bs_casse})
            }
        }catch(e){
            console.error(err);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

caisseBareVip = (app) => {
    app.get('/caisseBareVip', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await BarVipJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 'id_barVip', 
                    [fn('SUM', col('recette')),'total_recette'],
                    [col("BarVip.nom"), "NomBar"]
                ],
                    include: [{
                        model: BarVip,
                        attributes: [],
                    }],
                    group: ["mois", 'id_barVip',"NomBar"],
                    order: [['id_barVip','ASC']],
                    row:true
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseBarVip', {all_bs_casse})
            }
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

caisseCClub = (app) => {
    app.get('/caisseCClub', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await CrazyClubJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 'id_cclub', 
                    [fn('SUM', col('recette')),'total_recette'],
                    [col("CrazyClub.nom"), "NomCc"]
                ],
                    include: [{
                        model: CrazyClub,
                        attributes: [],
                    }],
                    group: ["mois", 'id_cclub',"NomCc"],
                    order: [['id_cclub','ASC']],
                    row:true
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseCclub', {all_bs_casse})
            }
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

caisseAppart = (app) => {
    app.get('/caisseAppart', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await AppartFondJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 
                    [fn('SUM', col('recette')),'total_recette'],
                ],
                    group: ["mois"],
                    row:true
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseAppart', {all_bs_casse})
            }
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

caisseCuisine = (app) => {
    app.get('/caisseCuisine', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await CuisineJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 
                    [fn('SUM', col('montant_verser')),'total_recette'],
                ],
                    group: ["mois"],
                    row:true
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseCuisine', {all_bs_casse})
            }
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

caisseMClose = (app) => {
    app.get('/caisseMClose', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
        try{
            const all_bs_casse = await ChambreJournal.findAll({
                attributes:[ 
                    [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 'id_mclose',
                    [fn('SUM', col('loyer')),'total_recette'],
                    [col("MaisonClose.nom"), "NomMc"]],
                    include: [{
                        model: MaisonColse,
                        attributes: [],
                    }],
                    group: ["mois", 'id_mclose', "NomMc"],
                    order: [["mois",'ASC'], ['id_mclose','ASC']]
            });
            if(all_bs_casse){
                //res.json(all_bs_casse);
                res.render('caisseMclose', {all_bs_casse})
            }
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

formAddCaisse = (app) =>{
    app.get('/formAddCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Occupe.findAll({
            include:[
                {model: Personnel},
                {model: Poste, where:{nom_poste: ['Comptable','Gerant','Caissier']}}
            ]
        })
            .then(personnels => {
                BarSimple.findAll()
                    .then(bs => {
                        BarVip.findAll()
                            .then(bv => {
                                CrazyClub.findAll()
                                    .then(cc => {
                                        res.status(200).render('add-caisse', {personnels: personnels, barSimples: bs, barVips: bv, crazycs: cc,})
                                    }).catch(_ => {
                                        console.error(_);
                                        res.redirect('/notFound');
                                        return; // On stoppe tout ici !
                                    })
                            }).catch(_ => {
                                console.error(_);
                                res.redirect('/notFound');
                                return; // On stoppe tout ici !
                            })
                    }).catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
        
    })
}

formEditCaisse = (app) =>{
    app.get('/formEditCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findByPk(req.params.id)
        .then(caisse => {
            Occupe.findAll({
                include:[
                    {model: Personnel},
                    {model: Poste, where:{nom_poste: 'Comptable'}}
                ]
            })
                .then(personnels => {
                    //const msg = "caisse recuperer avec succes"
                    res.status(200).render('edit-caisse', {caisse: caisse, personnels: personnels})
                })
                .catch(_ => {
                    console.error(_);
                    res.redirect('/notFound');
                    return; // On stoppe tout ici !
                })
        })
        .catch(_ => {
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        })
        
    })
}

oneCaisse = (app) => {
    app.get('/oneCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findByPk(req.params.id)
            .then(caisse => {
                const msg = "caisse recuperer avec succes"
                res.json({msg, data: caisse})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addCaisse = (app) => {
    app.post('/addCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, solde_init, recette_init, depence_init, comptable, bc_id} = req.body
        Caisse.create({
            nom: nom,
            solde: solde_init,
            recette: recette_init,
            depense: depence_init,
            id_employer: comptable,
            caisse_of: bc_id
        })
            .then(caisse => {
                const msg = "la caisse " + req.body.nom + "a ete ajouter avec succes"
                res.redirect('/allCaisse?msg=ajout')
                //res.json({msg, data: caisse})
            })
            .catch(err => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateCaisse = (app) => {
    app.put('/updateCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, solde_init, recette_init, depence_init, comptable} = req.body;
        Caisse.update({
            nom: nom,
            solde: solde_init,
            recette: recette_init,
            depense: depence_init,
            id_employer: comptable
        }, {
            where: {id_caisse: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification de la caisse avec succes"
                // res.json({msg})
                res.redirect('/allCaisse?msg=modif')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteCaisse = (app) => {
    app.delete('/deleteCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findByPk(req.params.id)
            .then(caisse => {
                const appartDel = caisse;
                Caisse.destroy({where: {id_caisse: appartDel.id_caisse}})
                    .then(_ => {
                        // const msg = "Suppression de la caisse avec succes"
                        // res.json({msg})
                        res.redirect('/allCaisse?msg=sup')
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
    })
}

module.exports = {
    allCaisse,
    oneCaisse,
    addCaisse,
    updateCaisse,
    deleteCaisse,
    formAddCaisse,
    formEditCaisse,
    caisseBareSimple,
    caisseBareVip,
    caisseAppart,
    caisseMClose,
    caisseCClub,
    caisseCuisine
}
//=================================end caise.js===============================

oneAppart = (app) => {
    app.get('/oneAppart/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const appartement = await Appartement.findByPk(req.params.id);
            if(appartement){
                const all_appart_font = await AppartFondJournal.findAll({
                    attributes:[ 
                        [literal("TO_CHAR(date, '%Y-%m')"), "mois"], 
                        [fn('SUM', col('recette')),'total_recette'],
                        [col("Appartement.nom_appart"), "NomAppart"]
                    ],
                        where:{id_appart:req.params.id},
                        include: [{
                            model: Appartement,
                            attributes: [],
                        }],
                        group: ["mois","NomAppart"],
                        order: [['mois','ASC']],
                        row:true
                });
                if(all_appart_font){
                    const history = await AppartFondJournal.findAll({
                        where: {id_appart: req.params.id}
                    })
                    if(history){
                        // console.log(history)
                        res.status(200).render('appart-detail', {appartement: appartement, courbe_info: all_appart_font, historys: history})
                    }
                }
            }
            
        }catch(e){
            res.redirect('/notFound');
            // console.log(e)
        }
        
            // .then(appartement => {
            //     const msg = "Appartement recuperer avec succes"
            //     //res.json({msg, data: appartement})
            //     // console.log(appartement)
                
            //     res.status(200).render('appart-detail', {appartement: appartement})
            // })
            // .catch(_ => console.log('erreure de selection'))

            
    })
}

//================================= index.js===============================
app.get('/index', protrctionRoot, authorise('admin'), async (req, res) => {
    const nvdate = new Date()
    const {firstDayISO, lastDayISO} = getDay()
    // console.log(firstDayISO, lastDayISO)
    try{
        const nb_personnel = await Personnel.count()
        const nb_appart = await Appartement.count()
        const nb_barSimple = await BarSimple.count()
        const nb_barVip = await BarVip.count()
        const nb_crazyClub = await CrazyClub.count()
        const sum_bc = nb_barSimple + nb_barVip + nb_crazyClub
        // -----------------------------------------------------------
        const sum_bs = await BarSimpleJournal.sum("recette", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
        // -----------------------------------------------------------
        const sum_bv = await BarVipJournal.sum("recette", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
        // -----------------------------------------------------------
        const sum_cc = await CrazyClubJournal.sum("recette", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
         // -----------------------------------------------------------
        const sum_cui = await CuisineJournal.sum("montant_verser", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
         // -----------------------------------------------------------
        const sum_ap = await AppartFondJournal.sum("recette", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
         // -----------------------------------------------------------
        const sum_ch = await ChambreJournal.sum("loyer", {
            where: {
                date: {
                    [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
                    [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
                }
            }
        })
        // -----------------------------------------------------------
         const sum_caisse_recette = await Caisse.sum("recette")
        // -----------------------------------------------------------
        // const sum_caisse_solde = await Caisse.sum("solde", {
        //     where: {
        //         date: {
        //             [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
        //             [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
        //         }
        //     }
        // })
        // -----------------------------------------------------------
        // const sum_caisse_depense = await Caisse.sum("depense", {
        //     where: {
        //         date: {
        //             [Op.gte]: new Date(nvdate.getFullYear(), nvdate.getMonth(), 1),
        //             [Op.lt]: new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1)
        //         }
        //     }
        // // -----------------------------------------------------------
        // })
        const nb_mc = await MaisonColse.count()
        // -----------------------------------------------------------
        const nb_ch = await Chambre.count()
        // -----------------------------------------------------------
        const nb_cu = await Cuisine.count()
        // -----------------------------------------------------------
        const nb_cat = await Categorie.count()
        // -----------------------------------------------------------
        const nb_prod = await Produit.count()
        // -----------------------------------------------------------
        const nb_emb = await Emballage.count()
        // -----------------------------------------------------------
        const nb_cai = await Caisse.count()
        // -----------------------------------------------------------
        const data = {
            "personnel": nb_personnel ?? 0,
            "nbAppart" : nb_appart ?? 0,
            "nbBarSimple" : nb_barSimple ?? 0,
            "nbBarVip" : nb_barVip ?? 0,
            "nbCrazyClub" : nb_crazyClub ?? 0,
            "nbMaisonClose" : nb_mc ?? 0,
            "nbChambre" : nb_ch ?? 0,
            "nbCuisine" : nb_cu ?? 0,
            "nbProduit" : nb_prod ?? 0,
            "nbCaisse" : nb_cai ?? 0,
            "nbEmballage" : nb_emb ?? 0,
            "nbCategorieArticle" : nb_cat ?? 0,
            "nbTotalBarClub" : sum_bc ?? 0,
            "recetteBarSimple" : sum_bs ?? 0,
            "recetteBarVip" : sum_bv ?? 0,
            "recetteCrazyClub" : sum_cc ?? 0,
            "recetteCuisine" : sum_cui ?? 0,
            "recetteAppart" : sum_ap ?? 0,
            "recetteChambre" : sum_ch ?? 0,
            "sum_caisse_recette" : sum_caisse_recette ?? 0,
            // "sum_caisse_solde" : sum_caisse_solde ?? 0,
            // "sum_caisse_depense" : sum_caisse_depense ?? 0,
        }
        res.render('index', {data: data})
    }catch(e){
        console.log(e)
    }
})
// -----------------------------------------------------------