const {BarVip} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allBarV = (app) => {
    app.get('/allBarV', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        BarVip.findAll({
            order:[['id_barVip', 'DESC']]
        })
            .then(barVs => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: barVs})

            })
            .catch(_ => console.log('erreure de selection all'))
    })
}

oneBarV = (app) => {
    app.get('/oneBarV/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        BarVip.findByPk(req.params.id)
            .then(barV => {
                const msg = "Bar recuperer avec succes"
                res.json({msg, data: barV})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addBarV = (app) => {
    app.post('/addBarV', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        BarVip.create({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
            capacite: capacite
        })
            .then(barS => {
                const msg = "le Bar  VIP" + req.body.name + "a ete ajouter avec succes"
                //res.json({msg, data: barS})
                res.redirect('/allBarClub?type=barv&msg=ajout')
            })
            .catch(_ => console.log('erreure de ajout', _))
    })
}

updateBarV = (app) => {
    app.put('/updateBarV/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        BarVip.update({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
            capacite: capacite
        }, {
            where: {id_barVip: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allBarClub?type=barv&msg=modif')
            })
            .catch(_ => console.log('erreure de modification', _))
    })
}

deleteBarV = (app) => {
    app.delete('/deleteBarV/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        BarVip.findByPk(req.params.id)
            .then(barV => {
                const appartDel = barV;
                BarVip.destroy({where: {id_barVip: appartDel.id_barVip}})
                    .then(_ => {
                        res.redirect('/allBarClub?type=barv&msg=sup')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allBarV,
    oneBarV,
    addBarV,
    updateBarV,
    deleteBarV
}