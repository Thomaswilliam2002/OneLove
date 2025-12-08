const {CaisseJournal} = require('../../db/sequelize')

allCJournal = (app) => {
    app.get('/allCJournal', (req, res) => {
        CaisseJournal.findAll({
            order:[['journal', 'DESC']]
        })
            .then(caisseJournals => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: caisseJournals})
            })
            .catch(_ => console.log('erreure de selection all'))
    })
}

oneCJournal = (app) => {
    app.post('/oneCJournal/:id', (req, res) => {
        CaisseJournal.findByPk(req.params.id)
            .then(caisseJournal => {
                const msg = "caisse Journal recuperer avec succes"
                res.json({msg, data: caisseJournal})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addCJournal = (app) => {
    app.get('/addCJournal', (req, res) => {
        CaisseJournal.Create(req.body)
            .then(caisseJournal => {
                const msg = "caisse Journal" + req.body.name + "a ete ajouter avec succes"
                res.json({msg, data: caisseJournal})
            })
            .catch(_ => console.log('erreure de ajout'))
    })
}

updateCJournal = (app) => {
    app.put('/updateCJournal/:id', (req, res) => {
        CaisseJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification de la caisse avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteCJournal = (app) => {
    app.delete('/deleteCJournal/:id', (req, res) => {
        CaisseJournal.findByPk(req.params.id)
            .then(barS => {
                const appartDel = barV;
                CaisseJournal.destroy({where: {id: appartDel.id}})
                    .then(_ => {
                        const msg = "Suppression du journal avec succes"
                        res.json({msg})
                    })
                    .catch(_ => console.log('erreure de suppression'))
            })
    })
}

module.exports = {
    allCJournal,
    oneCJournal,
    addCJournal,
    updateCJournal,
    deleteCJournal
}