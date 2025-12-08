const {ChambreJournal, MaisonColse, Chambre} = require('../../db/sequelize')

allChJournal = (app) => {
    app.get('/allChJournal', (req, res) => {
        ChambreJournal.findAll({
            include:[
                {model: MaisonColse},
                {model: Chambre}
            ],
            order:[['id_journal', 'DESC']]
        })
            .then(chambreJournals => {
                // const msg = "Liste recuperer avec succes"
                // res.json({msg, data: chambreJournals})
                //console.log(chambreJournals)
                res.status(200).render('histMClose', {journals:chambreJournals, msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

oneChJournal = (app) => {
    app.get('/oneChJournal/:id', (req, res) => {
        ChambreJournal.findByPk(req.params.id)
            .then(chambreJournal => {
                const msg = "chambre Journal recuperer avec succes"
                res.json({msg, data: chambreJournal})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addChJournal = (app) => {
    app.post('/addChJournal', (req, res) => {
        const {mclose1, chambre1, montant, date, commentaire} = req.body;
        ChambreJournal.create({
            loyer:montant,
            motif: '',
            description: commentaire,
            date: date,
            id_chambre: chambre1,
            id_mclose: mclose1
        })
            .then(chambreJournal => {
                res.redirect('/formFondBarClub?msg=ajout&type=mclose')
            })
            .catch(_ => console.log('erreure de ajout', _))
    })
}

updateChJournal = (app) => {
    app.put('/updateChJournal/:id', (req, res) => {
        
        ChambreJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification de chambre Journal avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteChJournal = (app) => {
    app.delete('/deleteChJournal/:id_j/:id_ch/:id_mc', (req, res) => {
        ChambreJournal.findByPk(req.params.id_j)
            .then(cj => {
                const appartDel = cj;
                ChambreJournal.destroy({where: {id_journal: appartDel.id_journal}})
                    .then(_ => {
                        // const msg = "Suppression du journal avec succes"
                        // res.json({msg})
                        if(req.query.sender === 'profil'){
                            res.redirect('/oneChambre/' + req.params.id_ch + '/' + req.params.id_mc)
                        }else if(req.query.sender === 'hist'){
                            res.redirect('/allChJournal')
                        }
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
            .catch(_ => console.log('erreure de suppression', _))
    })
}

module.exports = {
    allChJournal,
    oneChJournal,
    addChJournal,
    updateChJournal,
    deleteChJournal
}