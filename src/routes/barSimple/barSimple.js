const {BarSimple, Caisse} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allBarS = (app) => {
    app.get('/allBarS', protrctionRoot, authorise('admin', 'caissier central', 'comptable'), (req, res) => {
        BarSimple.findAll({
            order:[['id_barSimple', 'DESC']]
        })
            .then(barSs => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: barSs})
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

oneBarS = (app) => {
    app.get('/oneBarS/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        BarSimple.findByPk(req.params.id)
            .then(barS => {
                const msg = "Bar recuperer avec succes"
                res.json({msg, data: barS})
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

addBarS = (app) => {
    app.post('/addBarS', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        BarSimple.create({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
            capacite: capacite
        })
            .then(barS => {
                const msg = "le Bar " + req.body.nom + "a ete ajouter avec succes"
                //res.json({msg, data: barS})
                res.redirect('/allBarClub?type=bars&msg=ajout')
            })
            .catch(err => res.redirect('/notFound'))
    })
}

updateBarS = (app) => {
    app.put('/updateBarS/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, superficie, adresse, capacite} = req.body;
        BarSimple.update({
            nom: nom,
            adresse: adresse,
            superficie: superficie,
            capacite: capacite
        },{
            where:{id_barSimple: req.params.id}
        })
            .then(_ => {
                res.redirect('/allBarClub?type=bars&msg=modif')
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

deleteBarS = (app) => {
    app.delete('/deleteBarS/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        BarSimple.findByPk(req.params.id)
            .then(barS => {
                const appartDel = barS;
                BarSimple.destroy({where: {id_barSimple: appartDel.id_barSimple}})
                    .then(_ => {
                        res.redirect('/allBarClub?type=bars&msg=sup')
                    })
                    .catch(_ => res.redirect('/notFound'))
            })
    })
}

module.exports = {
    allBarS,
    oneBarS,
    addBarS,
    updateBarS,
    deleteBarS
}