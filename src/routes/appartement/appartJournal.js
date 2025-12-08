const {AppartJournal,AppartFondJournal, Appartement} = require('../../db/sequelize')

allJournal = (app) => {
    app.get('/allJournal', (req, res) => {
        AppartJournal.findAll({
            include:[
                {model: Appartement}
            ],
            order:[['id_journal', 'DESC']]
        })
            .then(journals => {
                res.status(200).render('appartJournal', {journals: journals, msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

appartFondJournal = (app) => {
    app.get('/appartFondJournal', async (req, res) =>{
        const hfond = await AppartFondJournal.findAll({
            order:[['id_journal', 'DESC']]
        })
        if(hfond){
            res.status(200).render('appartJournal', {hfonds: hfond, msg: req.query.msg, indice: req.query.indice})
        }else{
            console.log('erreure de selection all', _)
        }
    })
    
} 

oneJournal = (app) => {
    app.get('/oneJournal/:id', (req, res) => {
        AppartJournal.findByPk(req.params.id)
            .then(journal => {
                const msg = "Journal recuperer avec succes"
                res.json({msg, data: journal})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addJournal = (app) => {
    app.post('/addJournal', (req, res) => {
        const {appart, montant, depense, date} = req.body
        AppartFondJournal.create({
            id_appart: appart,
            recette:montant,
            depense: depense,
            date:date
        })
            .then(journal => {
                res.redirect('/formFondBarClub?msg=ajout&type=appart')
            })
            .catch(_ => console.log('erreure de ajout', _))
    })
}

updateJournal = (app) => {
    app.put('/updateJournal/:id', (req, res) => {
        AppartJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification du journal avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteFondJournal = (app) => {
    app.delete('/deleteFondJournal/:id', (req, res) => {
        AppartFondJournal.findByPk(req.params.id)
            .then(journal => {
                const appartDel = journal;
                AppartFondJournal.destroy({where: {id_journal: appartDel.id_journal}})
                    .then(_ => {
                        // const msg = "Suppression du journal avec succes"
                        // res.json({msg})
                        res.redirect('/appartFondJournal?msd=sup&indice=admin')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

deleteJournal = (app) => {
    app.delete('/deleteJournal/:id', (req, res) => {
        AppartJournal.findByPk(req.params.id)
            .then(journal => {
                const appartDel = journal;
                AppartJournal.destroy({where: {id_appart: appartDel.id_appart}})
                    .then(_ => {
                        // const msg = "Suppression du journal avec succes"
                        // res.json({msg})
                        res.redirect('/appartJournal?msd=sup&indice=admin')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allJournal,
    oneJournal,
    addJournal,
    updateJournal,
    deleteJournal,
    appartFondJournal,
    deleteFondJournal
}