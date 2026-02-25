const {HistSortie} = require('../../db/sequelize')
const {Produit, Emballage} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
allHSortie = (app) => {
    app.get('/allHSortie', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        HistSortie.findAll({
            order:[['id_hist', 'DESC']]
        })
            .then(hprobal=> {
                res.status(200).render('')
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

addHSortie = (app) => {
    app.post('/addHSortie/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        //console.log('ici')
        const {nbr, prix, type, idpro, dest, cmm} = req.body;
        if(req.query.art === 'produit'){
            console.log('id ',idpro)
            Produit.findByPk(req.params.id)
                .then(produit => {
                    const q = produit.quantiter
                    HistSortie.create({
                        quantiter: nbr,
                        prix_unit: prix,
                        type: type,
                        id_probal: idpro,
                        receveur: dest,
                        commantaire: cmm
                    })
                        .then(hsortie => {
                            console.log(hsortie)
                            Produit.update({
                                quantiter: parseInt(q) - parseInt(nbr)
                            },{
                                where: {id_produit:produit.id_produit}
                            })
                                .then(art => {
                                    res.redirect('/allProduit?type=vente&msg=ajout')
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
                    HistSortie.create({
                        quantiter: nbr,
                        prix_unit: prix,
                        type: type,
                        id_probal: idpro,
                        receveur: dest,
                        commantaire: cmm
                    })
                        .then(hsortie => {
                            Emballage.update({
                                quantiter: parseInt(q) - parseInt(nbr)
                            },{
                                where: {id_emballage:emballage.id_emballage}
                            })
                                .then(art => {
                                    res.redirect('/allEmballage?type=vente&msg=ajout')
                                })
                                .catch(_ => console.log('erreure de update', _))
                        })
                        .catch(_ => console.log('erreure de ajout', _))
                })
                .catch(_ => console.log('erreure de select', _))
        }
    })
}

deleteHSortie = (app) => {
    app.delete('/deleteHSortie/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        HistSortie.findByPk(req.params.id)
            .then(hvente => {
                const appartDel = hvente;
                HistSortie.destroy({where: {id_hist: appartDel.id_hist}})
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

module.exports = {
    allHSortie,
    addHSortie,
    deleteHSortie
}