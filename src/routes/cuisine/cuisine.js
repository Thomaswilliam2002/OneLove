const {Cuisine} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCuisine = (app) => {
    app.get('/allCuisine', protrctionRoot, authorise('admin', 'comptable', 'caissier central'), (req, res) => {
        Cuisine.findAll({
            order:[['id_cuisine', 'DESC']]
        })
            .then(cuisines => {
                const msg = "Liste recuperer avec succes"
                // res.json({msg, data: cuisines})
                res.status(200).render('all-cuisine',{cuisines: cuisines, msg: req.query.msg})
            })
            .catch(err => console.log('erreure de selection all' + err))
    })
}

formAddCuisine = (app) =>{
    app.get('/formAddCuisine', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        res.status(200).render('add-cuisine')
    })
}

formEditCuisine = (app) =>{
    app.get('/formEditCuisine/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Cuisine.findByPk(req.params.id)
            .then(cuisine => {
                res.status(200).render('edit-cuisine', {cuisine: cuisine})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

oneCuisine = (app) => {
    app.get('/oneCuisine/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Cuisine.findByPk(req.params.id)
            .then(cuisine => {
                const msg = "cuisine recuperer avec succes"
                res.json({msg, data: cuisine})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addCuisine = (app) => {
    app.post('/addCuisine', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, nom_lo, prenom, age, selectGenderOptions, numero, adresse, email, desc} = req.body
        Cuisine.create({
            nom_cuisine: nom,
            nom_locataire: nom_lo,
            prenom_locataire: prenom,
            adresse_locataire:adresse,
            email_locataire: email,
            numero_locataire: numero,
            description: desc
        })
            .then(cuisine => {
                const msg = "la cuisine " + req.body.name + "a ete ajouter avec succes"
                res.redirect('/allCuisine?msg=ajout')
            })
            .catch(_ => console.log('erreure de ajout'))
    })
}

updateCuisine = (app) => {
    app.put('/updateCuisine/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, nom_lo, prenom, age, selectGenderOptions, numero, email, adresse, desc} = req.body;
        Cuisine.update({
            nom_cuisine: nom,
            nom_locataire: nom_lo,
            prenom_locataire: prenom,
            adresse_locataire:adresse,
            email_locataire: email,
            numero_locataire: numero,
            description: desc
        }, {
            where: {id_cuisine: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification de la Cuisine avec succes"
                // res.json({_})
                res.redirect('/allCuisine?msg=modif')
            })
            .catch(_ => console.log('erreure de modification', _))
    })
}

deleteCuisine = (app) => {
    app.delete('/deleteCuisine/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Cuisine.findByPk(req.params.id)
            .then(cuisine => {
                const appartDel = cuisine;
                Cuisine.destroy({where: {id_cuisine: appartDel.id_cuisine}})
                    .then(_ => {
                        // const msg = "Suppression de la Cuisine avec succes"
                        // res.json({msg})
                        res.redirect('/allCuisine?msg=sup')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allCuisine,
    oneCuisine,
    addCuisine,
    updateCuisine,
    deleteCuisine,
    formAddCuisine,
    formEditCuisine
}