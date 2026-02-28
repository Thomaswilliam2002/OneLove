const { where } = require('sequelize')
const {MaisonColse} = require('../../db/sequelize')
const {Chambre, ChambreJournal} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

// formAddAdmin = (app) =>{
//     app.get('/formAddAdmin', (req, res) => {
//         res.status(200).render('add-admin')
//     })
// }

allMClose = (app) => {
    app.get('/allMClose', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        MaisonColse.findAll({
            order:[['id_mclose', 'DESC']]
        })
            .then(maisonColses => {
                Chambre.findAll({
                    include:[
                        {model: ChambreJournal},
                        {model:MaisonColse}
                    ]
                })
                    .then(chambres => {
                        //res.json(maisonColses)
                        console.log(JSON.parse(JSON.stringify(chambres)))
                        res.status(200).render('mclose',{maisonColses: maisonColses, chambres: chambres})
                    })
                //const msg = "Liste recuperer avec succes"
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

oneMClose = (app) => {
    app.get('/oneMClose/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        MaisonColse.findByPk(req.params.id)
            .then(maisonColse => {
                Chambre.findOne({
                    where: {id_mclose: maisonColse.id_mclose}
                })
                    .then(chambres => {
                        //res.json(maisonColses)
                        res.status(200).render('mclose-detail',{maisonColse: maisonColse, chambres: chambres})
                    })
                //res.status(200).render('mclose-detail')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addMClose = (app) => {
    app.post('/addMClose', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, adresse, nbr} = req.body
        MaisonColse.create({
            nom: nom,
            adresse: adresse,
            nb_chambre: nbr
        })
            .then(maisonColse => {
                // const msg = "la maisonColse " + req.body.nom + "a ete ajouter avec succes"
                // res.json({msg, data: maisonColse})
                res.redirect('/allMClose')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateMClose = (app) => {
    app.put('/updateMClose/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, adresse, nb} = req.body
        MaisonColse.update({
            nom: nom,
            adresse: adresse,
            nb_chambre: nb
        }, {
            where: {id_mclose: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification de la maisonColse avec succes"
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

deleteMClose = (app) => {
    app.delete('/deleteMClose/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        const appartDel = await MaisonColse.findByPk(req.params.id)
        ChambreJournal.destroy({
            where:{
                id_mclose: appartDel.id_mclose
            }
        })
            .then(_ => {
                Chambre.destroy({
                    where:{
                        id_mclose: appartDel.id_mclose
                    }
                })
                    .then(_ => {
                        MaisonColse.findByPk()
                            .then(maisonColse => {
                                MaisonColse.destroy({where: {id_mclose: appartDel.id_mclose}})
                                    .then(_ => {
                                        res.redirect('/allMClose')
                                    })
                                    .catch(_ => {
                                        console.error(_);
                                        res.redirect('/notFound');
                                        return; // On stoppe tout ici !
                                    })
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



module.exports = {
    allMClose,
    oneMClose,
    addMClose,
    updateMClose,
    deleteMClose
}