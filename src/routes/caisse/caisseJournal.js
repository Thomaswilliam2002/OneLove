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
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneCJournal = (app) => {
    app.post('/oneCJournal/:id', (req, res) => {
        CaisseJournal.findByPk(req.params.id)
            .then(caisseJournal => {
                const msg = "caisse Journal recuperer avec succes"
                res.json({msg, data: caisseJournal})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addCJournal = (app) => {
    app.get('/addCJournal', (req, res) => {
        CaisseJournal.Create(req.body)
            .then(caisseJournal => {
                const msg = "caisse Journal" + req.body.name + "a ete ajouter avec succes"
                res.json({msg, data: caisseJournal})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
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
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
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
    allCJournal,
    oneCJournal,
    addCJournal,
    updateCJournal,
    deleteCJournal
}