const {BarVipJournal, BarVip, Caisse} = require('../../db/sequelize')

allBVJournal = (app) => {
    app.get('/allBVJournal', (req, res) => {
        BarVipJournal.findAll({
            include:[
                {model: BarVip}
            ],
            order:[['id_journal', 'DESC']]
        })
            .then(barVipJournals => {
                // const msg = "Liste recuperer avec succes"
                // res.json({msg, data: barVipJournals})
                res.status(200).render('allJournal', {Journals: barVipJournals, type: 'vip', msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

oneBVJournal = (app) => {
    app.post('/oneBVJournal/:id', (req, res) => {
        BarVipJournal.findByPk(req.params.id)
            .then(barVipJournal => {
                const msg = "Journal recuperer avec succes"
                res.json({msg, data: barVipJournal})
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

addBVJournal = (app) => {
    app.post('/addBVJournal', async(req, res) => {
        try{
            const {barClub, montant, date, caisse} = req.body;
            if(caisse && caisse === 'null'){
                const barVipJournal = await BarVipJournal.create({
                    recette: montant,
                    depense: 0,
                    date: date,
                    id_barVip: parseInt(barClub.split(' ')[0])
                })
            }else if(caisse && caisse !== 'null'){
                const barVipJournal = await BarVipJournal.create({
                    recette: montant,
                    depense: 0,
                    date: date,
                    id_barVip: parseInt(barClub.split(' ')[0])
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
            res.redirect('/formFondBarClub?msg=ajout&type=bc' )
        }catch(e){
            res.redirect('/notFound')
        }
    })
}

updateBVJournal = (app) => {
    app.put('/updateBVJournal/:id', (req, res) => {
        BarVipJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification du journal avec succes"
                res.json({msg})
            })
            .catch(_ => res.redirect('/notFound'))
    })
}

deleteBVJournal = (app) => {
    app.delete('/deleteBVJournal/:id', (req, res) => {
        BarVipJournal.findByPk(req.params.id)
            .then(barVipJournal => {
                const appartDel = barVipJournal;
                BarVipJournal.destroy({where: {id_barVip: appartDel.id_barVip}})
                    .then(_ => {
                        res.redirect('/allBVJournal?msg=sup')
                    })
                    .catch(_ => res.redirect('/notFound'))
            })
    })
}

module.exports = {
    allBVJournal,
    oneBVJournal,
    addBVJournal,
    updateBVJournal,
    deleteBVJournal
}