const {CrazyClubJournal, CrazyClub, Caisse} = require('../../db/sequelize')

allCCJournal = (app) => {
    app.get('/allCCJournal', (req, res) => {
        CrazyClubJournal.findAll({
            include:[
                {model: CrazyClub}
            ],
            order:[['id_journal', 'DESC']]
        })
            .then(ccJournals => {
                // const msg = "Liste recuperer avec succes"
                // res.json({msg, data: barVipJournals})
                res.status(200).render('allJournal', {Journals: ccJournals, type: 'cc', msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => console.log('erreure de selection all'))
    })
}

oneCCJournal = (app) => {
    app.post('/oneCCJournal/:id', (req, res) => {
        CrazyClubJournal.findByPk(req.params.id)
            .then(ccJournal => {
                const msg = "Journal recuperer avec succes"
                res.json({msg, data: ccJournal})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addCCJournal = (app) => {
    app.post('/addCCJournal', async(req, res) => {
        try{
            const {barClub, montant, date, caisse} = req.body;
            if(caisse && caisse === 'null'){
                const ccJournal = await CrazyClubJournal.create({
                    recette: montant,
                    depense: 0,
                    date: date,
                    id_cclub: parseInt(barClub.split(' ')[0])
                })
            }else if(caisse && caisse !== 'null'){
                const ccJournal = CrazyClubJournal.create({
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
            console.log(e)
        }
    })
}

updateCCJournal = (app) => {
    app.put('/updateBVJournal/:id', (req, res) => {
        CrazyClub.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification du journal avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteCCJournal = (app) => {
    app.delete('/deleteCCJournal/:id', (req, res) => {
        CrazyClubJournal.findByPk(req.params.id)
            .then(ccJournal => {
                const appartDel = ccJournal;
                CrazyClubJournal.destroy({where: {id_cclub: appartDel.id_cclub}})
                    .then(_ => {
                        res.redirect('/allCCJournal?msg=sup')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allCCJournal,
    oneCCJournal,
    addCCJournal,
    updateCCJournal,
    deleteCCJournal
}