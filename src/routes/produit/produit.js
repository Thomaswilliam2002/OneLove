const {Produit, BarSimple, BarVip, CrazyClub} = require('../../db/sequelize');
const {Categorie} = require('../../db/sequelize');
const {HistEntrer} = require('../../db/sequelize');
const {HistSortie} = require('../../db/sequelize');
const {fn, col, literal, Op} = require('sequelize');
const { sequelize } = require('../../db/sequelize'); 
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allProduit = (app) => {
    app.get('/allProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findAll({
            order:[['id_produit', 'DESC']]
        })
            .then(produits => {
                Categorie.findAll()
                    .then(categories => {
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
                                            attributes: [
                                                [fn('TO_CHAR', col('created'), 'YYYY-MM'), 'mois'],
                                                'id_probal',
                                                [fn('SUM', literal('quantiter * prix_unit')), 'recette']
                                            ],
                                            where: { id_probal: req.params.id },
                                            group: [
                                                fn('TO_CHAR', col('created'), 'YYYY-MM'), 
                                                'id_probal', 
                                                'id_hist'
                                        ],
                                            raw: true
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
        const {nom, categ, qt, seuil, desc, prix} = req.body;
        Produit.create({
            nom: nom,
            quantiter: qt,
            seuil: seuil,
            description: desc,
            id_categ: categ
        })
            .then(produit => {
                HistEntrer.create({
                    quantiter: qt,
                    prix_unit: prix,
                    type: 'produit',
                    id_probal: produit.id_produit,
                    donneur: 'One Love'
                })
                    .then(hist => {
                        res.redirect('/allProduit?type=article&msg=ajout')
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
    app.delete('/deleteProduit/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        // Import de sequelize pour la transaction si non global
        const t = await sequelize.transaction();
        
        try {
            const produitId = req.params.id;
            const produit = await Produit.findByPk(produitId, { transaction: t });

            if (!produit) {
                await t.rollback();
                return res.redirect('/notFound');
            }

            // 1. Supprimer l'historique des mouvements de stock (Entrées/Sorties)
            await HistSortie.destroy({ where: { id_probal: produitId, type: 'produit' }, transaction: t });
            // Note: Vérifiez si votre table s'appelle HistEntrer ou HistEntree
            if (typeof HistEntrer !== 'undefined') {
                await HistEntrer.destroy({ where: { id_produit: produitId }, transaction: t });
            }

            // 2. IMPORTANT : Gérer l'historique des ventes en caisse
            // On supprime les traces de vente pour ce produit spécifique
            await HistCaisse.destroy({ 
                where: { id_probal: produitId, type: 'produit' }, 
                transaction: t 
            });

            // 3. Supprimer le produit lui-même
            await Produit.destroy({ where: { id_produit: produitId }, transaction: t });

            await t.commit();
            res.redirect('/allProduit?type=article&msg=sup');

        } catch (err) {
            // Annulation impérative de la transaction en cas d'échec
            if (t) await t.rollback();
            console.error("Erreur lors de la suppression du produit:", err);
            res.redirect('/notFound');
        }
    });
};
module.exports = {
    allProduit,
    formAddProduit,
    addProduit,
    deleteProduit,
    updateProduit,
    oneProduit
}