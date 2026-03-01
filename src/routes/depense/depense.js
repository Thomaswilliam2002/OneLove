const {CategorieDepense, Depense} = require('../../db/sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
const {fn, col, literal} = require('sequelize');
formAddDepense = (app) => {
    app.get('/formAddDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const categories = await CategorieDepense.findAll()
            if(categories){
                res.status(200).render('add-depense', {categories: categories});
            }else{
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            }
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

allDepense = (app) => {
    app.get('/allDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const depenses = await Depense.findAll({
                include:[
                    {model:CategorieDepense}
                ]
            })
            const categories = await CategorieDepense.findAll()
            const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');
            const sum_depenses = await Depense.findAll({
                attributes:[ 
                    [moisExpr, "mois"], 
                    [fn('SUM', col('montant')),'total_recette'],
                ],
                    group: [moisExpr, col('montant')],
                    order: [[moisExpr, 'DESC']],
                    raw:true
            });

            if(depenses && categories && sum_depenses){
                res.status(200).render('depense', {depenses: depenses, msg: req.query.msg, categories: categories, text_color: req.query.tc, sum_depenses: sum_depenses});
            }else{
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            }
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

addDepense = (app) => {
    app.post('/addDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const {nom, montant, desc, date, categ} = req.body;
            console.log("categorie", date)
            const depense = await Depense.create({
                nom: nom,
                montant: montant,
                date: date,
                description: desc,
                id_categ: categ
            })
            let msg = ""
            if(depense){
                msg = "Dépense ajouter avec succès"
            }else{
                msg = "Une erreur s'est produite. La dépense n'a pas pu être ajouter. Veillez réessayer !"
            }
            res.redirect(`/allDepense?msg=${msg}&tc=text-success`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

updateDepense = (app) => {
    app.put('/updateDepense/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const {nom, montant, desc, date, categ} = req.body;

            const depense = await Depense.update({
                nom: nom,
                montant: montant,
                date: date,
                description: desc,
                id_categ: categ
            },{
                where:{id_depense: req.params.id}
            })
            let msg = ""
            if(depense){
                msg = "Dépense mise a jour avec succès"
            }else{
                msg = "Une erreur s'est produite. La dépense n'a pas pu être mise a jour. Veillez réessayer !"
            }
            res.redirect(`/allDepense?msg=${msg}&tc=text-warning`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

deleteDepense = (app) => {
    app.delete('/deleteDepense/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const depense = await Depense.destroy({
                where:{id_depense: req.params.id}
            })
            let msg = ""
            if(depense){
                msg = "Dépense supprimer avec succès"
            }else{
                msg = "Une erreur s'est produite. La dépense n'a pas pu être supprimer. Veillez réessayer !"
            }
            res.redirect(`/allDepense?msg=${msg}&tc=text-danger`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

module.exports = {
    formAddDepense,
    allDepense,
    updateDepense,
    deleteDepense,
    addDepense
}