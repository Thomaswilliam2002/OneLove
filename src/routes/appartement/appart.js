const {Appartement, AppartFondJournal, AppartJournal, sequelize} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
const {fn, col, literal, where} = require('sequelize');

allAppart = (app) => {
    app.get('/allAppart', protrctionRoot, authorise('admin', 'comptable', 'caissier', 'gerant', 'caissier central'), (req, res) => {
        Appartement.findAll({
            where: {is_active: true},
            order:[['id_appart', 'DESC']]
        })
            .then(appartements => {
                const msg = "Liste recuperer avec succes"
                //res.json({msg, data: appartements})
                //console.log(appartements);
                res.status(200).render('appart-list', {appartements: appartements, msg: req.query.msg, tc: req.query.tc});
            })
            .catch(_ => {
                // console.log('erreure de selection all')
                res.redirect('/notFound');
            })
    })
}

oneAppart = (app) => {
    app.get('/oneAppart/:id', protrctionRoot, authorise('admin', 'comptable', 'caissier', 'gerant', 'caissier central'), async (req, res) => {
        try {
            const appartement = await Appartement.findByPk(req.params.id);
            
            if (!appartement) {
                return res.redirect('/notFound');
            }

            // Définition de l'expression de mois pour réutilisation dans attributes et group
            const moisExpr = fn('TO_CHAR', col('date_debut'), 'YYYY-MM');

            const all_appart_font = await AppartJournal.findAll({
                attributes: [ 
                    [moisExpr, "mois"], 
                    [fn('SUM', col('loyer')), 'total_recette'],
                    // [col("Appartement.nom_appart"), "NomAppart"]
                ],
                where: { id_appart: req.params.id },
                include: [{
                    model: Appartement,
                    required: true,
                    where: { is_active: true },
                    attributes: [],
                }],
                // Sous Postgres, on doit grouper par l'expression exacte et la colonne d'inclusion
                group: [moisExpr],
                order: [[moisExpr, 'ASC']],
                raw: true // Correction : 'raw' au lieu de 'row'
            });

            // const history = await AppartFondJournal.findAll({
            //     where: { id_appart: req.params.id },
            //     order: [['date', 'DESC']] // Optionnel : trier l'historique
            // });

            res.status(200).render('appart-detail', {
                appartement: appartement, 
                courbe_info: all_appart_font, 
                // historys: history
            });

        } catch (e) {
            console.error("Erreur oneAppart:", e);
            res.redirect('/notFound');
        }
    });
}

addAppart = (app) => {
    app.post('/addAppart', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        const {nom, prix, adresse, type, image, dispo, description} = req.body;

        const exist = await Appartement.findOne({
            where: {
                nom_appart: nom,
                is_active: true
            }
        })

        if (exist) {
            return res.redirect('/formAddAppart?msg=Un appartement portant ce nom existe deja.Pour eviter toute confusion, veuillez choisir un autre nom&tc=alert-warning');
        }

        console.log(req.body);
        Appartement.create({
            nom_appart: nom,
            prix_appart: prix,
            adresse_appart: adresse,
            photo_appart: image,
            type_appart: type,
            desc_appart: description,
            dispo_appart: dispo,
            //status: dispo,
            description: description
        })
            .then(appartement => {
                console.log("Appartement " + req.body.nom + "a ete ajouter avec succes")
                res.redirect('/allAppart?msg=ajout');
            })
            .catch(_ => {
                // console.log('erreure de ajout')
                res.redirect('/notFound');
            })
    })
}

formAddAppart = (app) =>{
    app.get('/formAddAppart', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        res.status(200).render('add-appart', {msg: req.query.msg, tc: req.query.tc})
    })
}
formEditAppart = (app) =>{
    app.get('/formEditAppart/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Appartement.findByPk(req.params.id)
            .then(appartement => {
                res.status(200).render('edit-appart', {appartement: appartement})
            })
            .catch(_ => {
                //console.log('erreure de selection');
                 res.redirect('/notFound');})
    })
}

updateAppart = (app) => {
    app.put('/updateAppart/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, prix, adresse, type, dispo} = req.body;
        Appartement.update({
            nom_appart: nom,
            prix_appart: prix,
            adresse_appart: adresse,
            type_appart: type,
            dispo_appart: dispo,
        }, 
        {
            where: {id_appart: req.params.id}
        })
            .then(_ => {
                console.log("Modification de l'Appartement avec succes")
                res.redirect('/allAppart?msg=modif');
            })
            .catch(_ => {
                //console.log('erreure de modification' , _);
                 res.redirect('/notFound');})
    })
}

deleteAppart = (app) => {
    app.delete('/deleteAppart/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {

        try{
            const t = await sequelize.transaction();
        
            // update retourne un tableau
            const [logicDel] = await Appartement.update(
                { is_active: false },
                { where: { id_appart: req.params.id}, transaction: t }
            )
        
            // desactiver toute l'historique du bar
            await AppartJournal.update(
                { is_active: false },
                { where: { id_appart: req.params.id, is_active: true  }, transaction: t }
            )

            await AppartFondJournal.update(
                { is_active: false },
                { where: { id_appart: req.params.id, is_active: true  }, transaction: t }
            )
        
            await t.commit();
        
            if (logicDel > 0) {
                return res.redirect('/allAppart?msg=Appartement supprimé avec succès&tc=alert-danger')
            } else {
                return res.redirect('/allAppart?msg=Appartement introuvable&tc=alert-warning')
            }
        
        }
        catch(e){
            console.error(e);
            await t.rollback();
            res.redirect('/notFound');
            return;
        }
        // Appartement.findByPk(req.params.id)
        //     .then(appartement => {
        //         const appartDel = appartement;
        //         Appartement.destroy({where: {id_appart: appartDel.id_appart}})
        //             .then(_ => {
        //                 const msg = "Suppression de l'Appartement avec succes"
        //                 //res.json({msg})
        //                 res.redirect('/allAppart?msg=sup');
        //             })
        //             .catch(_ => {
        //                 //console.log('erreure de suppression')
        //                 res.redirect('/notFound');
        //             })
        //     })
    })
}

module.exports = {
    allAppart,
    oneAppart,
    addAppart,
    updateAppart,
    deleteAppart,
    formAddAppart,
    formEditAppart
}