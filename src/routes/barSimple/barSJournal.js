const {BarSimpleJournal, BarSimple, Caisse} = require('../../db/sequelize')

allBSJournal = (app) => {
    app.get('/allBSJournal', (req, res) => {
        BarSimpleJournal.findAll({
            include:[
                {model: BarSimple}
            ],
            order:[['id_journal', 'DESC']]
        })
            .then(barSimpleJournals => {
                //res.json(barSimpleJournals)
                res.status(200).render('allJournal', {Journals: barSimpleJournals, type: 'simple', msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => console.log('erreure de selection all'))
    })
}

oneBSJournal = (app) => {
    app.get('/oneBSJournal/:id', (req, res) => {
        BarSimpleJournal.findByPk(req.params.id)
            .then(barSimpleJournal => {
                const msg = "Journal recuperer avec succes"
                res.json({msg, data: barSimpleJournal})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addBSJournal = (app) => {
    app.post('/addBSJournal', async (req, res) => {
        try{
            const {barClub, montant, date, caisse} = req.body;
            if(caisse && caisse === 'null'){
                const barSimpleJournal = await BarSimpleJournal.create({
                    recette: montant,
                    depense: 0,
                    date: date,
                    id_barSimple: parseInt(barClub.split(' ')[0])
                })
            }else if(caisse && caisse !== 'null'){
                const barSimpleJournal = await BarSimpleJournal.create({
                    recette: montant,
                    depense: 0,
                    date: date,
                    id_barSimple: parseInt(barClub.split(' ')[0])
                })

                const caisse_ = await Caisse.findByPk(caisse)
                if(caisse_){
                    let recette = caisse_.recette - montant < 0 ? 0 : caisse_.recette - montant
                    const up = await Caisse.update({
                        recette : recette,
                    },{
                        where: {id_caisse: caisse}
                    })
                }
            }
            res.redirect('/formFondBarClub?msg=ajout&type=bc')
        }
        catch(e){
            console.log(e)
        }
    })
}

updateBSJournal = (app) => {
    app.put('/updateBSJournal/:id', (req, res) => {
        BarSimpleJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification du journal avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteBSJournal = (app) => {
    app.delete('/deleteBSJournal/:id', (req, res) => {
        BarSimpleJournal.findByPk(req.params.id)
            .then(barSimpleJournal => {
                const appartDel = barSimpleJournal;
                BarSimpleJournal.destroy({where: {id_barSimple: appartDel.id_barSimple}})
                    .then(_ => {
                        res.redirect('/allBSJournal?msg=sup')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allBSJournal,
    oneBSJournal,
    addBSJournal,
    updateBSJournal,
    deleteBSJournal
}