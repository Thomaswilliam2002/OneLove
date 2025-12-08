const {Produit, BarSimple, BarVip, CrazyClub} = require('../../db/sequelize');
const {Categorie} = require('../../db/sequelize');
const {HistEntrer} = require('../../db/sequelize');
const {HistSortie} = require('../../db/sequelize');
const {fn, col, literal, Op} = require('sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allProduit = (app) => {
    app.get('/allProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findAll({
            order:[['id_produit', 'DESC']]
        })
            .then(produits => {
                Categorie.findAll()
                    .then(categories => {
                        //const msg = "Liste recuperer avec succes"
                        //console.log(produits)
                        HistEntrer.findAll({
                            attributes:[ 
                                [literal("DATE_FORMAT(created, '%Y-%m')"), "mois"], 'id_probal', 'type', 
                                [literal("SUM(quantiter * prix_unit)"),'total_recette'],
                                [literal("(SELECT nom FROM Produits where Produits.id_produit = HistEntrer.id_probal)"),'nom'],
                            ],
                                where: {
                                    type:{
                                        [Op.in]: ["produit"]
                                    }
                                },
                                group: ["id_probal", "mois"],
                                order: [["type"],['mois','ASC']],
                                row:true
                        })
                            .then(sumhe => {
                                BarSimple.findAll()
                                    .then(bs => {
                                        BarVip.findAll()
                                            .then(bv => {
                                                CrazyClub.findAll()
                                                    .then(cc => {
                                                        res.status(200).render('produit', {produits: produits,sumhes: sumhe, categories: categories, barSimples: bs, barVips: bv, crazycs: cc, msg: req.query.msg, type: req.query.type});
                                                    }).catch(_ => console.log('erreure de selection', _))
                                            }).catch(_ => console.log('erreure de selection', _))
                                    }).catch(_ => console.log('erreure de selection', _))
                            })
                            .catch(_ => console.log('erreure de selection', _))
                    })
                    .catch(_ => console.log('erreure de selection all', _))
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

formAddProduit = (app) => {
    app.get('/formAddProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findAll()
            .then(categories => {
                //const msg = "Liste recuperer avec succes"
                res.status(200).render('add-produit', {categories: categories});
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

oneProduit = (app) => {
    app.get('/oneProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findByPk(req.params.id)
            .then(produit => {
                HistEntrer.findAll({
                    where: {id_probal: produit.id_produit, type: 'produit'}
                })
                    .then(hachats => {
                        HistSortie.findAll({
                            where: {id_probal: produit.id_produit, type: 'produit'}
                        })
                            .then(hventes => {
                                HistEntrer.findAll({
                                    attributes:[
                                        [fn('DATE_FORMAT', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                        [literal("SUM(quantiter * prix_unit)"),'recette']],
                                        where: {
                                            id_probal: produit.id_produit, type: 'produit'
                                        },
                                        group: [literal('mois')],
                                        order: [[literal('mois'), 'ASC']]
                                })
                                    .then(hr => {
                                        HistSortie.findAll({
                                            attributes:[
                                                [fn('DATE_FORMAT', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                                [literal("SUM(quantiter * prix_unit)"),'recette']],
                                                where: {
                                                    id_probal: produit.id_produit, type: 'produit'
                                                },
                                                group: [literal('mois')],
                                                order: [[literal('mois'), 'ASC']]
                                        })
                                            .then(hs => {
                                                //res.json(hr)
                                                res.status(200).render('produit-detail', {histe: hr, hists: hs, produit: produit, hachats: hachats, hventes: hventes, msg: req.query.msg, type: req.query.type})
                                            })
                                            .catch(_ => console.log('erreure de selection', _))
                                    })
                                    .catch(_ => console.log('erreure de selection', _))
                            })
                            .catch(_ => console.log('erreure de selection', _))
                    })
                    .catch(_ => console.log('erreure de selection', _))
            })
            .catch(_ => console.log('erreure de selection', _))
    })
}
addProduit = (app) => {
    app.post('/addProduit', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, qt, seuil, desc} = req.body;
        Produit.create({
            nom: nom,
            quantiter: qt,
            seuil: seuil,
            description: desc,
            id_categ: categ
        })
            .then(produit => {
                //const msg = "categorie cree avec succes"
                //res.json({msg, data: categorie})
                res.redirect('/allProduit?type=article&msg=ajout')
            })
            .catch(_ => console.log('erreure de ajout', _))
    })
}

updateProduit = (app) => {
    app.put('/updateProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, seuil, desc} = req.body;
        Produit.update({
            nom: nom, 
            seuil: seuil,
            description: desc,
            id_categ: categ
        },{
            where:{id_produit: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allProduit?type=article&msg=modif')
            })
            .catch(_ => console.log('erreure de modification', _))
    })
}

deleteProduit = (app) => {
    app.delete('/deleteProduit/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Produit.findByPk(req.params.id)
            .then(produit => {
                const appartDel = produit;
                Produit.destroy({where: {id_produit: appartDel.id_produit}})
                    .then(_ => {
                        res.redirect('/allProduit?type=article&msg=sup')
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allProduit,
    formAddProduit,
    addProduit,
    deleteProduit,
    updateProduit,
    oneProduit
}