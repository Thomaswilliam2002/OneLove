const {HistEntrer} = require('../../db/sequelize')
const {Produit, Emballage} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allHEntrer = (app) => {
    app.get('/allHEntrer', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        HistEntrer.findAll({
            order:[['id_hist', 'DESC']]
        })
            .then(harticles => {
                res.status(200).render('')
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

addHEntrer = (app) => {
    app.post('/addHEntrer/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nb, prix, type, idpro, dest} = req.body;
        if(req.query.art === 'produit'){
            Produit.findByPk(req.params.id)
                .then(produit => {
                    const q = produit.quantiter
                    HistEntrer.create({
                        quantiter: nb,
                        prix_unit: prix,
                        type: type,
                        id_probal: idpro,
                        donneur: 'One Love'
                    })
                        .then(hentrer => {
                            //const f = parseInt(q) + parseInt(nb)
                            //console.log(f)
                            Produit.update({
                                quantiter: parseInt(q) + parseInt(nb)
                            },{
                                where: {id_produit: produit.id_produit}
                            })
                                .then(prod => {
                                    res.redirect('/allProduit?type=achat&msg=ajout')
                                })
                                .catch(_ => console.log('erreure de update', _))
                        })
                        .catch(_ => console.log('erreure de ajout', _))
                })
                .catch(_ => console.log('erreure de select', _))
        }
        else if(req.query.art === 'emballage'){
            Emballage.findByPk(req.params.id)
                .then(emballage => {
                    const q = emballage.quantiter
                    HistEntrer.create({
                        quantiter: nb,
                        prix_unit: prix,
                        type: type,
                        id_probal: idpro,
                        donneur: dest
                    })
                        .then(hentrer => {
                            //const f = parseInt(q) + parseInt(nb)
                            //console.log(f)
                            Emballage.update({
                                quantiter: parseInt(q) + parseInt(nb)
                            },{
                                where: {id_emballage: emballage.id_emballage}
                            })
                                .then(prod => {
                                    res.redirect('/allEmballage?type=achat&msg=ajout')
                                })
                                .catch(_ => console.log('erreure de update', _))
                        })
                        .catch(_ => console.log('erreure de ajout', _))
                })
                .catch(_ => console.log('erreure de select', _))
        }
        
    })
}

deleteHEntrer = (app) => {
    app.delete('/deleteHEntrer/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
            HistEntrer.findByPk(req.params.id)
            .then(hentrer => {
                const appartDel = hentrer;
                HistEntrer.destroy({where: {id_hist: appartDel.id_hist}})
                    .then(_ => {
                        if(appartDel.type === 'produit'){
                            res.redirect('/oneProduit/' + req.query.id + '?msg=sup&type=achat')
                        }else if(appartDel.type === 'emballage'){
                            res.redirect('/oneEmballage/' + req.query.id + '?msg=sup&type=achat')
                        }
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
        
    })
}

// if(req.query.art === 'produit'){
//     HistEntrer.findOne({
//         where: {id_hist: req.params.id, type: 'produit'}
//     })
//     .then(hentrer => {
//         const appartDel = hentrer;
//         HistEntrer.destroy({where: {id_hist: appartDel.id_hist}})
//             .then(_ => {
//                 res.redirect('/oneProduit/' + req.query.id + '?msg=sup&type=achat')
//             })
//             .catch(_ => console.log('erreure de suppression', _))
//     })
// }
// else if(req.query.art === 'emballage'){
//     HistEntrer.findOne({
//         where: {id_hist: req.params.id, type: 'emballage'}
//     })
//     .then(hentrer => {
//         const appartDel = hentrer;
//         HistEntrer.destroy({where: {id_hist: appartDel.id_hist}})
//             .then(_ => {
//                 res.redirect('/oneEmballage/' + req.query.id + '?msg=sup&type=achat')
//             })
//             .catch(_ => console.log('erreure de suppression', _))
//     })
// }

module.exports = {
    allHEntrer,
    addHEntrer,
    deleteHEntrer
}