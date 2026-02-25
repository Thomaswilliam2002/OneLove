const {Poste} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

// Poste.findOne({
//     where: {nom_poste: 'Admin'}
// })
//     .then(poste => {
//         if(poste){
//             //console.log(poste)
//         }else{
//             Poste.create({
//                 nom_poste: 'Admin',
//                 salaire: 0,
//                 description: ''
//             })
//                 .then(poste => {
//                 })
//                 .catch(_ => console.log('erreure de ajout', _))
//         }
        
//     })
//     .catch(_ => console.log('erreure de selection ', _))
    
allPoste = (app) => {
    app.get('/allPoste', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Poste.findAll({
            order:[['id_poste', 'DESC']]
        })
            .then(postes => {
                const msg = "Liste recuperer avec succes"
                //res.json({msg, data: postes})
                res.status(200).render('poste', {postes: postes, msg: req.query.msg});
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

onePoste = (app) => {
    app.get('/onePoste/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Poste.findByPk(req.params.id)
            .then(poste => {
                const msg = "personnel recuperer avec succes"
                res.json({msg, data: poste})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addPoste = (app) => {
    app.post('/addPoste', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, salaire, desc} = req.body
        Poste.create({
            nom_poste: nom,
            salaire: salaire,
            description: desc 
        })
            .then(poste => {
                const msg = "le Poste " + req.body.nom + "a ete ajouter avec succes"
                //res.json({msg, data: poste})
                res.redirect('allPoste?msg=ajout');
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updatePoste = (app) => {
    app.put('/updatePoste/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, salaire, desc} = req.body;
        Poste.update({
            nom_poste: nom,
            salaire: salaire,
            description: desc 
        },{
            where: {id_poste: req.params.id}
        })
            .then(_ => {
                res.redirect('/allPoste?msg=modif');
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deletePoste = (app) => {
    app.delete('/deletePoste/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Poste.findByPk(req.params.id)
            .then(poste => {
                const appartDel = poste;
                Poste.destroy({where: {id_poste: appartDel.id_poste}})
                    .then(_ => {
                        res.redirect('/allPoste?msg=sup')
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
    })
}

module.exports = {
    allPoste,
    onePoste,
    addPoste,
    updatePoste,
    deletePoste
}