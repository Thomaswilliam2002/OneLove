const { Model } = require('sequelize')
const {CuisineJournal, Cuisine} = require('../../db/sequelize')

allCuJournal = (app) => {
    app.get('/allCuJournal', (req, res) => {
        Cuisine.findAll({
            include:[
                {model: CuisineJournal}
            ],
            order:[['id_cuisine', 'DESC']]
        })
            .then(jcuisines => {
                res.status(200).render('cuisineJournal', {jcuisines: jcuisines, msg: req.query.msg, indice: req.query.indice})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneCuJournal = (app) => {
    app.get('/oneCuJournal/:id', (req, res) => {
        CuisineJournal.findByPk(req.params.id)
            .then(cuisine => {
                const msg = "chambre Journal recuperer avec succes"
                res.json({msg, data: cuisine})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addCuJournal = (app) => {
    app.post('/addCuJournal', (req, res) => {
        const {cuisine, montant, date} = req.body
        CuisineJournal.create({
            montant_verser: montant,
            date: date,
            comentaire: '',
            id_cuisine: cuisine
        })
            .then(journal => {
                msg = 'Journal ajouter avec succes'
                res.redirect('/formFondBarClub?type=cuisine&msg=' + msg)
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateCuJournal = (app) => {
    app.put('/updateCuJournal/:id', (req, res) => {
        CuisineJournal.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification de cuisine Journal avec succes"
                res.json({msg})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteCuJournal = (app) => {
    app.delete('/deleteCuJournal/:id', (req, res) => {
        CuisineJournal.findByPk(req.params.id)
            .then(jcuisine => {
                const appartDel = jcuisine;
                CuisineJournal.destroy({where: {id_journal: appartDel.id_journal}})
                    .then(_ => {
                        res.redirect('/allCuJournal?msg=sup&indice' + req.query.indice)
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
    allCuJournal,
    oneCuJournal,
    addCuJournal,
    updateCuJournal,
    deleteCuJournal
}