const { Caisse, BarSimpleJournal, BarVipJournal, AppartFondJournal, ChambreJournal, BarSimple, BarVip } = require('../../db/sequelize')
const { Poste, Appartement, MaisonColse, CrazyClub, CrazyClubJournal, HistCaisse, CuisineJournal } = require('../../db/sequelize')
const { Personnel } = require('../../db/sequelize')
const { Occupe } = require('../../db/sequelize')
const { fn, col, literal } = require('sequelize');
const { protrctionRoot, authorise } = require('../../middleware/protectRoot');

// --- Liste des caisses ---
allCaisse = (app) => {
    app.get('/allCaisse', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.findAll({ order: [['id_caisse', 'DESC']] })
            .then(caisses => {
                Personnel.findAll().then(personnels => {
                    HistCaisse.findAll().then(histcaise => {
                        res.status(200).render('caisse-list', { caisses, personnels, histcaises: histcaise, msg: req.query.msg })
                    }).catch(err => { console.error(err); res.redirect('/notFound'); })
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
                group: [moisExpr, 'id_barSimple', col("BarSimple.nom")],
                order: [['id_barSimple', 'ASC']],
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
                group: [moisExpr, 'id_barVip', col("BarVip.nom")],
                order: [['id_barVip', 'ASC']],
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
                group: [moisExpr, 'id_cclub', col("CrazyClub.nom")],
                order: [['id_cclub', 'ASC']],
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
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await AppartFondJournal.findAll({
                attributes: [
                    [moisExpr, "mois"],
                    [fn('SUM', col('recette')), 'total_recette'],
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
                group: [moisExpr, 'id_mclose', col("MaisonClose.nom")],
                order: [[moisExpr, 'ASC'], ['id_mclose', 'ASC']],
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
                include: [{ model: Personnel }, { model: Poste, where: { nom_poste: 'Comptable' } }]
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
    app.delete('/deleteCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Caisse.destroy({ where: { id_caisse: req.params.id } })
            .then(() => res.redirect('/allCaisse?msg=sup'))
            .catch(err => { console.error(err); res.redirect('/notFound'); });
    })
}

module.exports = {
    allCaisse, caisseBareSimple, caisseBareVip, caisseAppart, caisseMClose, caisseCClub, caisseCuisine,
    formAddCaisse, formEditCaisse, addCaisse, updateCaisse, deleteCaisse
};