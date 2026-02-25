const {Emballage, BarSimple, BarVip, CrazyClub} = require('../../db/sequelize');
const {Categorie} = require('../../db/sequelize');
const {HistEntrer} = require('../../db/sequelize');
const {HistSortie} = require('../../db/sequelize');
const {fn, col, literal, Op} = require('sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allEmballage = (app) => {
    app.get('/allEmballage', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Emballage.findAll({
            order:[['id_emballage', 'DESC']]
        })
            .then(emballages => {
                Categorie.findAll()
                    .then(categories => {
                        BarSimple.findAll()
                            .then(bs => {
                                BarVip.findAll()
                                    .then(bv => {
                                        CrazyClub.findAll()
                                            .then(cc => {
                                                res.status(200).render('emballage', {emballages: emballages, categories: categories, barSimples: bs, barVips: bv, crazycs: cc, msg: req.query.msg, type: req.query.type});
                                            }).catch(_ => {
                                                console.error(_);
                                                res.redirect('/notFound');
                                                return; // On stoppe tout ici !
                                            })
                                    }).catch(_ => {
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
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

formAddEmballage = (app) => {
    app.get('/formAddEmballage', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findAll()
            .then(categories => {
                //const msg = "Liste recuperer avec succes"
                res.status(200).render('add-emballage', {categories: categories});
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneEmballage = (app) => {
    app.get('/oneEmballage/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Emballage.findByPk(req.params.id)
            .then(emballage => {
                HistEntrer.findAll({
                    where: {id_probal: emballage.id_emballage, type: 'emballage'}
                })
                    .then(hachats => {
                        HistSortie.findAll({
                            where: {id_probal: emballage.id_emballage, type: 'emballage'}
                        })
                            .then(hventes => {
                                HistEntrer.findAll({
                                    attributes:[
                                        [fn('TO_CHAR', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                        [literal("SUM(quantiter * prix_unit)"),'recette']],
                                        where: {
                                            id_probal: emballage.id_emballage, type: 'emballage'
                                        },
                                        group: [literal('mois')],
                                        order: [[literal('mois'), 'ASC']]
                                })
                                    .then(hr => {
                                        HistSortie.findAll({
                                            attributes:[
                                                [fn('TO_CHAR', col('created'), '%Y-%m'), 'mois'],'id_probal',
                                                [literal("SUM(quantiter * prix_unit)"),'recette']],
                                                where: {
                                                    id_probal: emballage.id_emballage, type: 'emballage'
                                                },
                                                group: [literal('mois')],
                                                order: [[literal('mois'), 'ASC']]
                                        })
                                            .then(hs => {
                                                res.status(200).render('emballage-detail', {histe: hr, hists: hs, emballage: emballage, hachats: hachats, hventes: hventes, msg: req.query.msg, type: req.query.type})
                                            })
                                            .catch(_ => {
                                                console.error(_);
                                                res.redirect('/notFound');
                                                return; // On stoppe tout ici !
                                            })
                                    })
                                    .catch(_ => {
                                        console.error(_);
                                        res.redirect('/notFound');
                                        return; // On stoppe tout ici !
                                    })
                            })
                            .catch(_ => {
                                console.error(_);
                                res.redirect('/notFound');
                                return; // On stoppe tout ici !
                            })
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}
addEmballage = (app) => {
    app.post('/addEmballage', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, qt, seuil, desc} = req.body;
        Emballage.create({
            nom: nom,
            quantiter: qt,
            seuil: seuil,
            description: desc,
            id_categ: categ
        })
            .then(emballage => {
                //const msg = "categorie cree avec succes"
                //res.json({msg, data: categorie})
                res.redirect('/allEmballage?type=article&msg=ajout')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateEmballage = (app) => {
    app.put('/updateEmballage/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, categ, seuil, desc} = req.body;
        Emballage.update({
            nom: nom,
            seuil: seuil,
            description: desc,
            id_categ: categ
        },{
            where:{id_emballage: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allEmballage?type=article&msg=modif')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteEmballage = (app) => {
    app.delete('/deleteEmballage/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Emballage.findByPk(req.params.id)
            .then(emballage => {
                const appartDel = emballage;
                Emballage.destroy({where: {id_emballage: appartDel.id_emballage}})
                    .then(_ => {
                        res.redirect('/allEmballage?type=article&msg=sup')
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
    allEmballage,
    formAddEmballage,
    addEmballage,
    deleteEmballage,
    updateEmballage,
    oneEmballage
}