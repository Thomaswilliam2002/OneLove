const {Categorie} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCateg = (app) => {
    app.get(['/allCateg','/formAddCateg'], protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findAll({
            order:[['id_categ', 'DESC']]
        })
            .then(categories => {
                //const msg = "Liste recuperer avec succes"
                res.status(200).render('add-categ', {categories: categories, msg: req.query.msg});
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

// formAddCateg = (app) => {
//     app.get('/formAddCateg', (req, res) => {
//         res.status(200).render('add-categ');
//     })
// }

addCateg = (app) => {
    app.post('/addCateg', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, desc} = req.body;
        Categorie.create({
            nom: nom,
            description: desc,
        })
            .then(categorie => {
                const msg = "categorie cree avec succes"
                //res.json({msg, data: categorie})
                res.redirect('/allCateg?&msg=ajout')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

// updateBarV = (app) => {
//     app.put('/updateCateg/:id', (req, res) => {
//         const {nom, superficie, adresse, capacite} = req.body;
//         BarVip.update({
//             nom: nom,
//             adresse: adresse,
//             superficie: superficie,
//             capacite: capacite
//         }, {
//             where: {id_barVip: req.params.id}
//         })
//             .then(_ => {
//                 // const msg = "Modification du bar avec succes"
//                 // res.json({msg})
//                 res.redirect('/allBarClub?type=barv&msg=modif')
//             })
//             .catch(_ => console.log('erreure de modification', _))
//     })
// }

deleteCateg = (app) => {
    app.delete('/deleteCateg/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findByPk(req.params.id)
            .then(categorie => {
                const appartDel = categorie;
                Categorie.destroy({where: {id_categ: appartDel.id_categ}})
                    .then(_ => {
                        res.redirect('/allCateg?msg=sup')
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
    addCateg,
    allCateg,
    deleteCateg,
    //formAddCateg
}