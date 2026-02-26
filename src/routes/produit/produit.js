const {Produit, BarSimple, BarVip, CrazyClub} = require('../../db/sequelize');
const {Categorie} = require('../../db/sequelize');
const {HistEntrer} = require('../../db/sequelize');
const {HistSortie} = require('../../db/sequelize');
const {fn, col, literal, Op} = require('sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allProduit = (app) => {
    app.get('/allProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findAll({
            order:[['id_produit', 'DESC']]
        })
            .then(produits => {
                Categorie.findAll()
                    .then(categories => {
                        //const msg = "Liste recuperer avec succes"
                        //console.log(produits)
                        // HistEntrer.findAll({
                        //     attributes:[ 
                        //         // 1. Correction du format date pour Postgres (YYYY-MM)
                        //         [literal("TO_CHAR(\"HistEntrer\".\"created\", 'YYYY-MM')"), "mois"], 
                        //         'id_probal', 
                        //         'type',
                        //         [literal("SUM(\"quantiter\" * \"prix_unit\")"), 'total_recette'],
                        //         // 2. Correction du SELECT interne : Majuscule à Produits + S à la fin
                        //         [literal('(SELECT "nom" FROM "Produits" WHERE "Produits"."id_produit" = "HistEntrer"."id_probal")'), 'nom'],
                        //         // [literal("TO_CHAR(created, '%Y-%m')"), "mois"], 'id_probal', 'type', 
                        //         // [literal("SUM(quantiter * prix_unit)"),'total_recette'],
                        //         // [literal("(SELECT nom FROM produits where produits.id_produit = histEntrers.id_probal)"),'nom'],
                        //     ],
                        //         where: {
                        //             type:{
                        //                 [Op.in]: ["produits"]
                        //             }
                        //         },
                        //         group: ["id_probal", "mois"],
                        //         order: [["type"],['mois','ASC']],
                        //         row:true
                        // })
                        HistEntrer.findAll({
                            attributes: [
                                // Utilisation de YYYY-MM pour Postgres
                                [literal("TO_CHAR(\"HistEntrer\".\"created\", 'YYYY-MM')"), "mois"], 
                                'id_probal', 
                                'type',
                                [literal("SUM(\"quantiter\" * \"prix_unit\")"), 'total_recette'],
                                // On force "Produits" avec majuscule et guillemets pour correspondre à ta DB
                                [literal('(SELECT "nom" FROM "Produits" WHERE "Produits"."id_produit" = "HistEntrer"."id_probal")'), 'nom'],
                            ],
                            where: {
                                type: {
                                    [Op.in]: ["produit"] // Attention : "produit" au singulier comme dans ton where plus bas
                                }
                            },
                            // Groupement complet requis par Postgres
                            group: ["id_probal", "type", "HistEntrer.id_hist", literal("TO_CHAR(\"HistEntrer\".\"created\", 'YYYY-MM')")],
                            order: [["type"], [literal("mois"), 'ASC']],
                            raw: true // Correction de 'row' en 'raw'
                        })
                            .then(sumhe => {
                                BarSimple.findAll()
                                    .then(bs => {
                                        BarVip.findAll()
                                            .then(bv => {
                                                CrazyClub.findAll()
                                                    .then(cc => {
                                                        res.status(200).render('produit', {produits: produits,sumhes: sumhe, categories: categories, barSimples: bs, barVips: bv, crazycs: cc, msg: req.query.msg, type: req.query.type});
                                                    }).catch(_ => {
                                                        console.error(_);
                                                        res.redirect('/notFound');
                                                        return; // On stoppe tout ici !
                                                    })
                                            }).catch(_ =>{
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

formAddProduit = (app) => {
    app.get('/formAddProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findAll()
            .then(categories => {
                //const msg = "Liste recuperer avec succes"
                res.status(200).render('add-produit', {categories: categories});
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneProduit = (app) => {
    app.get('/oneProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findByPk(req.params.id)
            .then(produit => {
                HistEntrer.findAll({
                    where: {id_probal: produit.id_produit, type: 'produit'}
                })
                    .then(hachats => {
                        HistSortie.findAll({
                            where: {id_probal: produit.id_produit, type: 'produit'}
                        })
                            .then(hventes => {
                                HistEntrer.findAll({
                                    attributes: [
                                        // Correction de la date pour PostgreSQL
                                        [literal("TO_CHAR(\"HistEntrer\".\"created\", 'YYYY-MM')"), "mois"], 
                                        'id_probal', 
                                        'type',
                                        [literal("SUM(\"quantiter\" * \"prix_unit\")"), 'total_recette'],
                                        // Correction CRITIQUE : "Produits" avec majuscule et guillemets doubles
                                        [literal('(SELECT "nom" FROM "Produits" WHERE "Produits"."id_produit" = "HistEntrer"."id_probal")'), 'nom'],
                                    ],
                                    where: {
                                        type: { [Op.in]: ["produit"] }
                                    },
                                    // Ajout de la clé primaire correcte 'id_hist' au groupement
                                    group: [
                                        "id_probal", 
                                        "type", 
                                        "HistEntrer.id_hist", 
                                        literal("TO_CHAR(\"HistEntrer\".\"created\", 'YYYY-MM')")
                                    ],
                                    order: [["type"], [literal("mois"), 'ASC']],
                                    raw: true // Assurez-vous que c'est bien 'raw' et non 'row'
                                })
                                    .then(hr => {
                                        HistSortie.findAll({
                                            attributes:[
                                                [fn('TO_CHAR', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                                [literal("SUM(quantiter * prix_unit)"),'recette']],
                                                where: {
                                                    id_probal: produit.id_produit, type: 'produit'
                                                },
                                                group: [literal('mois')],
                                                order: [[literal('mois'), 'ASC']]
                                        })
                                            .then(hs => {
                                                //res.json(hr)
                                                res.status(200).render('produit-detail', {histe: hr, hists: hs, produit: produit, hachats: hachats, hventes: hventes, msg: req.query.msg, type: req.query.type})
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
addProduit = (app) => {
    app.post('/addProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, qt, seuil, desc} = req.body;
        Produit.create({
            nom: nom,
            quantiter: qt,
            seuil: seuil,
            description: desc,
            id_categ: categ
        })
            .then(produit => {
                //const msg = "categorie cree avec succes"
                //res.json({msg, data: categorie})
                res.redirect('/allProduit?type=article&msg=ajout')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateProduit = (app) => {
    app.put('/updateProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, seuil, desc} = req.body;
        Produit.update({
            nom: nom, 
            seuil: seuil,
            description: desc,
            id_categ: categ
        },{
            where:{id_produit: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allProduit?type=article&msg=modif')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteProduit = (app) => {
    app.delete('/deleteProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findByPk(req.params.id)
            .then(produit => {
                const appartDel = produit;
                Produit.destroy({where: {id_produit: appartDel.id_produit}})
                    .then(_ => {
                        res.redirect('/allProduit?type=article&msg=sup')
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
    allProduit,
    formAddProduit,
    addProduit,
    deleteProduit,
    updateProduit,
    oneProduit
}