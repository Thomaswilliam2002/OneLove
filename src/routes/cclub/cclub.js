const {CrazyClub} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCClub = (app) => {
    app.get('/allBarV', (req, res) => {
        BarVip.findAll({
            order:[['id_cclub', 'DESC']]
        })
            .then(cclubs => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: cclubs})
                res.redirect('all-Bar-club', {cclubs: cclubs, type: req.query.type, msg: req.query.msg})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneCClub = (app) => {
    app.get('/oneCClub/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        CrazyClub.findByPk(req.params.id)
            .then(cclub => {
                const msg = "Bar recuperer avec succes"
                res.json({msg, data: cclub})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addCClub = (app) => {
    app.post('/addCClub', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        CrazyClub.create({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
            //capacite: capacite
        })
            .then(cclub => {
                //const msg = "le Bar  VIP" + req.body.name + "a ete ajouter avec succes"
                //res.json({msg, data: barS})
                res.redirect('/allBarClub?type=crazyc&msg=ajout')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateCClub = (app) => {
    app.put('/updateCClub/:id', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        CrazyClub.update({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
        }, {
            where: {id_cclub: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allBarClub?type=crazyc&msg=modif')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteCClub = (app) => {
    app.delete('/deleteCClub/:id', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        CrazyClub.findByPk(req.params.id)
            .then(cclub => {
                const appartDel = cclub;
                CrazyClub.destroy({where: {id_cclub: appartDel.id_cclub}})
                    .then(_ => {
                        res.redirect('/allBarClub?type=crazyc&msg=sup')
                    })
                    .catch(_ => {
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
}

module.exports = {
    allCClub,
    oneCClub,
    addCClub,
    updateCClub,
    deleteCClub
}