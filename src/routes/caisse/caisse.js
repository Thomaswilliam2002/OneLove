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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 'id_barSimple', 
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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 'id_barVip', 
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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 'id_cclub', 
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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 
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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 
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
                    [literal("DATE_FORMAT(date, '%Y-%m')"), "mois"], 'id_mclose',
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