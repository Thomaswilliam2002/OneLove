const {Categorie, Produit, Emballage, sequelize, HistEntrer, HistSortie} = require('../../db/sequelize')

const { Op } = require('sequelize');

const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCateg = (app) => {
    app.get(['/allCateg','/formAddCateg'], protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Categorie.findAll({
            where: {is_active: true},
            order:[['id_categ', 'DESC']]
        })
            .then(categories => {
                //const msg = "Liste recuperer avec succes"
                res.status(200).render('add-categ', {categories: categories, msg: req.query.msg, tc: req.query.tc});
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
                res.redirect('/allCateg?&msg=Categorie cree avec succes&tc=alert-success')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}


deleteCateg = (app) => {

    app.delete('/deleteCateg/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {

    try{

        const t = await sequelize.transaction();

        const id_categ = req.params.id;

        const categ = await Categorie.findOne({
            where:{ id_categ:id_categ, is_active:true }
        });
        
        if(!categ){
            return res.redirect('/allCategorie?msg=Categorie introuvable&tc=alert-warning');
        }

        // récupérer produits
        const produits = await Produit.findAll({
            attributes:['id_produit'],
            where:{ id_categ, is_active: true },
            transaction:t
        });

        // récupérer emballages
        const emballages = await Emballage.findAll({
            attributes:['id_emballage'],
            where:{ id_categ, is_active: true },
            transaction:t
        });

        const prodIds = produits.map(p => p.id_produit);
        const embalIds = emballages.map(e => e.id_emballage);


        // désactiver produits
        await Produit.update(
            { is_active:false },
            { where:{ id_categ }, transaction:t }
        );

        // désactiver emballages
        await Emballage.update(
            { is_active:false },
            { where:{ id_categ }, transaction:t }
        );


        // désactiver historique produit
        await HistEntrer.update(
            { is_active:false },
            {
            where:{
                id_probal:{ [Op.in]: prodIds },
                type:'produit'
            },
            transaction:t
            }
        );


        // désactiver historique emballage
        await HistEntrer.update(
        { is_active:false },
            {
            where:{
                id_probal:{ [Op.in]: embalIds },
                type:'emballage'
            },
            transaction:t
            }
        );


        // désactiver historique caisse produit
        await HistSortie.update(
            { is_active:false },
            {
            where:{
                id_probal:{ [Op.in]: prodIds },
                type:'produit'
            },
            transaction:t
            }
        );


        // désactiver historique caisse emballage
        await HistSortie.update(
            { is_active:false },
            {
            where:{
                id_probal:{ [Op.in]: embalIds },
                type:'emballage'
            },
            transaction:t
            }
        );


        // désactiver catégorie
        await Categorie.update(
            { is_active:false },
            { where:{ id_categ }, transaction:t }
        );


        await t.commit();

        return res.redirect('/allCategorie?msg=Categorie supprimée avec succès&tc=alert-danger');

    }catch(e){

        await t.rollback();
        console.error(e);
        res.redirect('/notFound');

    }   

    })
}
module.exports = {
    addCateg,
    allCateg,
    deleteCateg,
    //formAddCateg
}