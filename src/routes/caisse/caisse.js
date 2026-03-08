const {Caisse, BarSimpleJournal, BarVipJournal, AppartFondJournal, ChambreJournal, BarSimple, BarVip} = require('../../db/sequelize')
const {Poste, Appartement, MaisonColse, CrazyClub, CrazyClubJournal, HistCaisse, CuisineJournal, Cuisine, CaissePersonnel} = require('../../db/sequelize')
const {Personnel, sequelize} = require('../../db/sequelize')
const {Occupe} = require('../../db/sequelize')
const {fn, col, literal, Op, where} = require('sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

//route qui affiche le formulaire pour cree une caisse
formAddCaisse = (app) =>{
    app.get('/formAddCaisse', async (req, res) => {
        try{
            const personnels = await Occupe.findAll({
                include:[
                    { 
                        model: Personnel,
                        required: false,
                        where:{ is_active: true }
                    },
                    { 
                        model: Poste,
                        required: false,
                        where:{
                            nom_poste: ['Comptable','Gerant','Caissier'],
                            is_active: true
                        }
                    }
                ],
                where: { is_active: true },
                order: [['id_occupe', 'DESC']]
            });
            const bars = await BarSimple.findAll({where: { is_active: true }});
            const vips = await BarVip.findAll({where: { is_active: true }});
            const clubs = await CrazyClub.findAll({where: { is_active: true }});
            const cuisines = await Cuisine.findAll({where: { is_active: true }});
            const maisons = await MaisonColse.findAll({where: { is_active: true }});
            const appartements = await Appartement.findAll({where: { is_active: true }});
            const caisse = await Caisse.findAll({where: { is_active: true }});
            res.render('add-caisse', { 
                personnels, bars, vips, clubs, cuisines, appartements, maisons, caisse, msg:req.query.msg, tc:req.query.tc
            });
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return;
        }
    });
}

assignCaisse = (app) =>{
    app.post('/assignCaisse', async (req, res) => {
        try {
            const { id_caisse, id_personnel } = req.body;

            // On vérifie si le lien existe déjà pour éviter les doublons
            const existeDeja = await CaissePersonnel.findOne({ 
                where: { id_caisse, id_personnel, is_active: true } 
            });

            if (existeDeja) {
                return res.redirect('/formAddCaisse?msg=Ce caissier est déjà lié à cette caisse&tc=alert-warning');
            }

            // Ajout du lien dans la table pivot
            await CaissePersonnel.create({ id_caisse, id_personnel });

            res.redirect('/formAddCaisse?msg=Nouvel affectation réussie !&tc=alert-success');
        } catch (e) {
            console.log(e);
            res.redirect('/notFound');
        }
    });
}

//route ajout d'une nouvelle caisse
addCaisse = (app) => {
    app.post('/addCaisse', async (req, res) => {
        try {
            const { nom, id_personnel, lieu_composite } = req.body;
        
            // 1. Vérification de l'existence du nom (Optimisée avec findOne)
            const caisseExistante = await Caisse.findOne({
                where: {
                    is_active: true,
                    [Op.and]: sequelize.where(
                        sequelize.fn('lower', sequelize.col('nom')),
                        nom.toLowerCase()
                    )
                }
            });

            if (caisseExistante) {
                // IMPORTANT: le 'return' arrête l'exécution de la fonction ici
                return res.redirect('/formAddCaisse?msg=Une caisse portant ce nom existe deja.Pour eviter toute confusion, veuillez choisir un autre nom&tc=alert-warning');
            }

            // 2. Découpage du lieu
            const [typeLieu, idLieu, nom_lieu] = lieu_composite.split('\\');

            // 3. Création de la Caisse
            const nouvelleCaisse = await Caisse.create({
                nom: nom,
                type_lieu: typeLieu,
                id_lieu: idLieu,
                nom_lieu: nom_lieu
            });

            // 4. Liaison avec le Caissier (Table Pivot)
            await CaissePersonnel.create({
                id_caisse: nouvelleCaisse.id_caisse,
                id_personnel: id_personnel
            });

            // Réponse finale
            return res.redirect('/formAddCaisse?msg=Caisse créée avec succès&tc=alert-success');

        } catch (error) {
            console.error("Erreur création caisse:", error);
            // On vérifie si une réponse n'a pas déjà été envoyée avant d'envoyer l'erreur 500
            if (!res.headersSent) {
                return res.redirect('/notFound');
            }
        }
    });
}

// --- Liste des caisses ---
allCaisse = (app) => {
    app.get('/allCaisse', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            // Récupération des caisses avec leurs caissiers
            const caisses = await Caisse.findAll({
                include: [{
                    model: Personnel,
                    required: false,
                    where: { is_active: true },
                    through: { attributes: ['id_personnel', 'id_caisse'] } 
                }],
                where: { is_active: true },
                order: [['id_caisse', 'DESC']]
            });

            res.status(200).render('caisse-list', {
                caisses: caisses,
                msg: req.query.msg,
                tc: req.query.tc
            });

        } catch (err) {
            console.error("Erreur dans allCaisse:", err);
            res.redirect('/notFound');
        }
    });
};

// --- Caisse Bar Simple ---
caisseBareSimple = (app) => {
    app.get('/caisseBareSimple', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const all_bs_casse = await BarSimpleJournal.findAll({
                where: { is_active: true },
                attributes: [
                    [moisExpr, "mois"], 
                    'id_barSimple',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("BarSimple.nom"), "NomBar"]
                ],
                include: [{ model: BarSimple, attributes: [], where: { is_active: true }, required: false }],
                group: [moisExpr, col('BarSimpleJournal.id_barSimple'), col("BarSimple.nom")],
                order: [
                    [literal('"mois"'), 'ASC'], 
                    [col('BarSimpleJournal.id_barSimple'), 'ASC']
                ],
                raw: true,
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
                where: { is_active: true },
                attributes: [
                    [moisExpr, "mois"], 
                    'id_barVip',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("BarVip.nom"), "NomBar"]
                ],
                include: [{ model: BarVip, attributes: [], required: false, where: { is_active: true } }],
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
                where: { is_active: true },
                attributes: [
                    [moisExpr, "mois"], 
                    'id_cclub',
                    [fn('SUM', col('recette')), 'total_recette'],
                    [col("CrazyClub.nom"), "NomCc"]
                ],
                include: [{ model: CrazyClub, attributes: [], where: { is_active: true }, required: false }],
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
            const all_bs_casse = await AppartFondJournal.findAll({
                where: { is_active: true },
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
                where: { is_active: true },
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
                where: { is_active: true },
                attributes: [
                    [moisExpr, "mois"], 
                    'id_mclose',
                    [fn('SUM', col('loyer')), 'total_recette'],
                    [col("MaisonClose.nom"), "NomMc"]
                ],
                include: [{ model: MaisonColse, attributes: [], where: { is_active: true }, required: false }],
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

// --- Actions CRUD Classiques ---
formEditCaisse = (app) =>{
    app.get('/formEditCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const caisses = await Caisse.findByPk(req.params.id, {
                include: [{
                    model: Personnel,
                    required: false,
                    where: { is_active: true },
                    through: { attributes: [] } 
                }],
                where: { is_active: true }
            });

            const caissiers = await Occupe.findAll({
                include:[
                    {model: Personnel, required: false, where: { is_active: true }},
                    {model: Poste, where:{nom_poste: 'caissier', is_active: true}, required: false}
                ],
                where: { is_active: true }
            })

            res.render('edit-caisse', {caisse: caisses, personnels: caissiers});
        }
        catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

updateCaisse = (app) => {
    app.put('/updateCaisse/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {

        const t = await sequelize.transaction();

        try {

            const { nom, new_caissier, old_caissier, id_caisse } = req.body;
            console.log()
            // Vérifier si le nom existe déjà (sauf cette caisse)
            const caisseExistante = await Caisse.findOne({
                where: {
                    [Op.and]: [
                        sequelize.where(
                            sequelize.fn('lower', sequelize.col('nom')),
                            nom.toLowerCase()
                        ),
                        { id_caisse: { [Op.ne]: req.params.id } }
                    ]
                },
                transaction: t
            });

            if (caisseExistante) {
                await t.rollback();
                return res.redirect('/allCaisse/' + req.params.id + '?msg=Une caisse portant ce nom existe deja&tc=alert-warning');
            }

            // Vérifier que le caissier existe
            const personnelExiste = await Personnel.findByPk(new_caissier, { transaction: t });

            if (!personnelExiste) {
                await t.rollback();
                return res.redirect('/allCaisse?msg=Le caissier n\'existe pas&tc=alert-danger');
            }

            // Vérifier si le lien existe déjà
            const existeDeja = await CaissePersonnel.findOne({
                where: { id_caisse, id_personnel: new_caissier, is_active: true },
                transaction: t
            });

            if (existeDeja) {
                await t.rollback();
                return res.redirect('/allCaisse/?msg=Ce caissier est déjà lié à cette caisse&tc=alert-warning');
            }

            // Mise à jour du caissier
            await CaissePersonnel.update(
                { id_personnel: new_caissier },
                {
                    where: { id_caisse, id_personnel: old_caissier },
                    transaction: t
                }
            );

            // Mise à jour du nom de la caiss
            const caisse = await Caisse.findByPk(req.params.id);

            if (!caisse) {
                return res.redirect('/allCaisse?msg=Caisse introuvable&tc=alert-danger');
            }

            await Caisse.update(
                { nom },
                { where: { id_caisse: req.params.id }, transaction: t }
            );

            await t.commit();

            res.redirect('/allCaisse?msg=Modification de la caisse effectuée !&tc=alert-success');

        } catch (e) {

            await t.rollback();
            console.error(e);
            res.redirect('/notFound');

        }

    });
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
            res.redirect('/allCaisse?msg=Suppression de la caisse effectuée !&tc=alert-success');

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