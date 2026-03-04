const { Caisse, BarSimpleJournal, BarVipJournal, AppartFondJournal, ChambreJournal, BarSimple, BarVip, Emballage } = require('../../db/sequelize')
const { Poste, Appartement, MaisonColse, CrazyClub, CrazyClubJournal, HistCaisse, CuisineJournal, AppartJournal } = require('../../db/sequelize')
const { Personnel, Produit } = require('../../db/sequelize')
const { Occupe } = require('../../db/sequelize')
const { fn, col, literal } = require('sequelize');
const { protrctionRoot, authorise } = require('../../middleware/protectRoot');
const { sequelize } = require('../../db/sequelize'); 

// --- Liste des caisses ---
allCaisse = (app) => {
    app.get('/allCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findAll({ order: [['id_caisse', 'DESC']] })
            .then(caisses => {
                Personnel.findAll().then(personnels => {
                    res.status(200).render('caisse-list', { caisses, personnels, msg: req.query.msg })
                }).catch(err => { console.error(err); res.redirect('/notFound'); })
            }).catch(err => { console.error(err); res.redirect('/notFound'); })
    })
}

// --- Caisse Bar Simple ---
caisseBareSimple = (app) => {
    app.get('/caisseBareSimple', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await BarSimpleJournal.findAll({
                attributes: [
                    [moisExpr, "mois"], 
                    'id_barSimple',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("BarSimple.nom"), "NomBar"]
                ],
                include: [{ model: BarSimple, attributes: [] }],
                group: [moisExpr, col('BarSimpleJournal.id_barSimple'), col("BarSimple.nom")],
                order: [
                    [literal('"mois"'), 'ASC'], 
                    [col('BarSimpleJournal.id_barSimple'), 'ASC']
                ],
                raw: true
            });
            res.render('caisseBareSimple', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Caisse Bar VIP ---
caisseBareVip = (app) => {
    app.get('/caisseBareVip', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await BarVipJournal.findAll({
                attributes: [
                    [moisExpr, "mois"], 
                    'id_barVip',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("BarVip.nom"), "NomBar"]
                ],
                include: [{ model: BarVip, attributes: [] }],
                group: [moisExpr, col('BarVipJournal.id_barVip'), col("BarVip.nom")],
                order: [
                    [literal('"mois"'), 'ASC'], 
                    [col('BarVipJournal.id_barVip'), 'ASC']
                ],
                raw: true
            });
            res.render('caisseBarVip', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Caisse Crazy Club ---
caisseCClub = (app) => {
    app.get('/caisseCClub', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await CrazyClubJournal.findAll({
                attributes: [
                    [moisExpr, "mois"], 
                    'id_cclub',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("CrazyClub.nom"), "NomCc"]
                ],
                include: [{ model: CrazyClub, attributes: [] }],
                group: [moisExpr, col('CClubJournal.id_cclub'), col("CrazyClub.nom")],
                order: [
                    [literal('"mois"'), 'ASC'], 
                    [col('CClubJournal.id_cclub'), 'ASC']
                ],
                raw: true
            });
            res.render('caisseCclub', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Caisse Appartement ---
caisseAppart = (app) => {
    app.get('/caisseAppart', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date_debut'), 'YYYY-MM');
            const all_bs_casse = await AppartJournal.findAll({
                attributes: [
                    [moisExpr, "mois"],
                    [fn('SUM', col('loyer')), 'total_recette'],
                ],
                group: [moisExpr],
                raw: true
            });
            res.render('caisseAppart', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Caisse Cuisine ---
caisseCuisine = (app) => {
    app.get('/caisseCuisine', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await CuisineJournal.findAll({
                attributes: [
                    [moisExpr, "mois"],
                    [fn('SUM', col('montant_verser')), 'total_recette'],
                ],
                group: [moisExpr],
                raw: true
            });
            res.render('caisseCuisine', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Caisse Maison Close ---
caisseMClose = (app) => {
    app.get('/caisseMClose', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await ChambreJournal.findAll({
                attributes: [
                    [moisExpr, "mois"], 
                    'id_mclose',
                    [fn('SUM', col('loyer')), 'total_recette'],
                    [col("MaisonClose.nom"), "NomMc"]
                ],
                include: [{ model: MaisonColse, attributes: [] }],
                group: [moisExpr, col('ChambreJournal.id_mclose'), col("MaisonClose.nom")],
                order: [[moisExpr, 'ASC'], [col('ChambreJournal.id_mclose'), 'ASC']],
                raw: true
            });
            res.render('caisseMclose', { all_bs_casse });
        } catch (e) {
            console.error(e);
            res.redirect('/notFound');
        }
    })
}

// --- Formulaire Ajout (Optimisé avec Promise.all) ---
formAddCaisse = (app) => {
    app.get('/formAddCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const pPersonnels = Occupe.findAll({
            include: [
                { model: Personnel },
                { model: Poste, where: { nom_poste: ['Comptable', 'Gerant', 'Caissier'] } }
            ]
        });
        const pBarSimples = BarSimple.findAll();
        const pBarVips = BarVip.findAll();
        const pCrazyClub = CrazyClub.findAll();

        Promise.all([pPersonnels, pBarSimples, pBarVips, pCrazyClub])
            .then(([personnels, bs, bv, cc]) => {
                res.status(200).render('add-caisse', { personnels, barSimples: bs, barVips: bv, crazycs: cc });
            })
            .catch(err => { console.error(err); res.redirect('/notFound'); });
    })
}

// --- Actions CRUD Classiques ---
formEditCaisse = (app) => {
    app.get('/formEditCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findByPk(req.params.id).then(caisse => {
            Occupe.findAll({
                include: [{ model: Personnel }, { model: Poste, where: { nom_poste: 'Caissier' } }]
            }).then(personnels => {
                res.status(200).render('edit-caisse', { caisse, personnels })
            }).catch(err => { console.error(err); res.redirect('/notFound'); })
        }).catch(err => { console.error(err); res.redirect('/notFound'); })
    })
}

addCaisse = (app) => {
    app.post('/addCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const { nom, solde_init, recette_init, depence_init, comptable, bc_id } = req.body;
        Caisse.create({
            nom: nom,
            solde: solde_init,
            recette: recette_init,
            depense: depence_init,
            id_employer: comptable,
            caisse_of: bc_id
        }).then(() => res.redirect('/allCaisse?msg=ajout'))
          .catch(err => { console.error(err); res.redirect('/notFound'); });
    })
}

updateCaisse = (app) => {
    app.put('/updateCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const { nom, solde_init, recette_init, depence_init, comptable } = req.body;
        Caisse.update({
            nom, solde: solde_init, recette: recette_init, depense: depence_init, id_employer: comptable
        }, { where: { id_caisse: req.params.id } })
        .then(() => res.redirect('/allCaisse?msg=modif'))
        .catch(err => { console.error(err); res.redirect('/notFound'); });
    })
}

deleteCaisse = (app) => {
    app.delete('/deleteCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        // On récupère l'instance de sequelize pour la transaction
        const t = await sequelize.transaction();

        try {
            const caisseId = req.params.id;
            const caisse = await Caisse.findByPk(caisseId, { transaction: t });
            
            if (!caisse) {
                await t.rollback();
                return res.redirect('/notFound');
            }

            // 1. Récupérer l'historique de la caisse pour restaurer les stocks
            // const allHist = await HistCaisse.findAll({ where: { id_caisse: caisseId }, transaction: t });

            // if (allHist.length > 0) {
            //     for (const hist of allHist) {
            //         const qte = hist.quantiter;
            //         if (hist.type === 'emballage') {
            //             await Emballage.update(
            //                 { quantiter: literal(`quantiter + ${qte}`) },
            //                 { where: { id_emballage: hist.id_probal }, transaction: t }
            //             );
            //         } else if (hist.type === 'produit') {
            //             await Produit.update(
            //                 { quantiter: literal(`quantiter + ${qte}`) },
            //                 { where: { id_produit: hist.id_probal }, transaction: t }
            //             );
            //         }
            //     }
            // }

            // 2. Supprimer l'historique lié (pour éviter les données orphelines)
            await HistCaisse.destroy({ where: { id_caisse: caisseId }, transaction: t });

            // 3. Supprimer la caisse
            await caisse.destroy({ transaction: t });

            // On valide tous les changements
            await t.commit();
            res.redirect('/allCaisse?msg=sup');

        } catch (e) {
            // En cas d'erreur, on annule tout ce qui a été fait
            if (t) await t.rollback();
            console.error("Erreur lors de la suppression de la caisse:", e);
            res.redirect('/notFound');
        }
    });
};

// Ajoute la fonction si elle manque
oneCaisse = (app) => {
    app.get('/oneCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findByPk(req.params.id)
            .then(caisse => {
                if(!caisse) return res.redirect('/notFound');
                res.status(200).render('caisse-detail', { caisse });
            })
            .catch(err => {
                console.error(err);
                res.redirect('/notFound');
            });
    });
};

module.exports = {
    allCaisse, caisseBareSimple, caisseBareVip, caisseAppart, caisseMClose, caisseCClub, caisseCuisine,
    formAddCaisse, formEditCaisse, addCaisse, updateCaisse, deleteCaisse, oneCaisse
};