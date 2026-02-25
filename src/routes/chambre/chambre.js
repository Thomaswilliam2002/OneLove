const { where } = require('sequelize')
const {Chambre, MaisonColse, Occupent, ChambreJournal} = require('../../db/sequelize')
const occupent = require('../../models/occupent')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
const chambreJournal = require('../../models/chambreJournal');

allChambre = (app) => {
    app.get('/allChambre', (req, res) => {
        Chambre.findAll({
            order:[['id_chambre', 'DESC']]
        })
            .then(chambres => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: chambres})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneChambre = (app) => {
    app.get('/oneChambre/:id/:id_mc', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        MaisonColse.findByPk(req.params.id_mc)
            .then(maisonColse => {
                Chambre.findByPk(req.params.id)
                    .then(chambre => {
                        Occupent.findAll({
                            where: {id_chambre: chambre.id_chambre, id_mclose: maisonColse.id_mclose}
                        })
                            .then(occupent => {
                                ChambreJournal.findAll({where:{
                                    id_mclose : req.params.id_mc, id_chambre : req.params.id
                                }})
                                    .then(cj => {
                                        res.status(200).render('chambre-detail', {chambre: chambre, maisonColse: maisonColse, occupent: occupent, chambreJournals: cj})
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

addChambre = (app) => {
    app.post('/addChambre', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, montant, dispo, mclose, desc} = req.body
        Chambre.create({
            nom: nom,
            loyer: montant,
            disponibiliter: dispo,
            description: desc,
            id_mclose: mclose
        })
            .then(chambre => {
                // const msg = "la chambre " + req.body.nom + "a ete ajouter avec succes"
                // res.json({msg, data: chambre})
                res.redirect('/allMClose')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateChambre = (app) => {
    app.put('/updateChambre/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, loyer, dispo, desc} = req.body
        Chambre.update({
            nom: nom,
            loyer: loyer,
            disponibiliter: dispo,
            description: desc,
        }, {
            where: {id_chambre: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification de la chambre avec succes"
                // res.json({msg})
                res.redirect('/allMClose')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteChambre = (app) => {
    app.delete('/deleteChambre/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Chambre.findByPk(req.params.id)
            .then(chambre => {
                const appartDel = chambre;
                Chambre.destroy({where: {id_chambre: appartDel.id_chambre}})
                    .then(_ => {
                        // const msg = "Suppression de la chambre avec succes"
                        // res.json({msg})
                        //console.log('fais')
                        res.redirect('/allMClose')
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
    allChambre,
    oneChambre,
    addChambre,
    updateChambre,
    deleteChambre
}