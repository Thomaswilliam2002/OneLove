const {CategorieDepense} = require('../../db/sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
formAddCategorieDepense = (app) => {
    app.get('/formAddCategorieDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            res.status(200).render('/index');
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

allCategorieDepense = (app) => {
    app.get('/allCategorieDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            console.log("allCategorieDepense")
            const categories = await CategorieDepense.findAll()
            if(categories){
                res.status(200).render('categorieDepense', {categories: categories, msg: req.query.msg , text_color: req.query.tc});
            }else{
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            }
            // res.json({"ok": "ok"})
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

addCategorieDepense = (app) => {
    app.post('/addCategorieDepense', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const {nom, desc} = req.body;

            const categorie = await CategorieDepense.create({
                nom: nom,
                description: desc
            })
            let msg = ""
            if(categorie){
                msg = "Categorie ajouter avec succès"
            }else{
                msg = "Une erreur s'est produite. La categorie n'a pas pu être ajouter. Veillez réessayer !"
            }
            res.redirect(`/allCategorieDepense?msg=${msg}&tc=text-success`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

updateCategorieDepense = (app) => {
    app.put('/updateCategorieDepense/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const {nom, desc} = req.body;

            const categorie = await CategorieDepense.update({
                nom: nom,
                description: desc
            },{
                where:{id_categ: req.params.id}
            })
            let msg = ""
            if(categorie){
                msg = "Categorie mise a jour avec succès"
            }else{
                msg = "Une erreur s'est produite. La Categorie n'a pas pu être mise a jour. Veillez réessayer !"
            }
            res.redirect(`/allCategorieDepense?msg=${msg}&tc=text-warning`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

deleteCategorieDepense = (app) => {
    app.delete('/deleteCategorieDepense/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const categorie = await CategorieDepense.destroy({
                where:{id_categ: req.params.id}
            })
            let msg = ""
            if(categorie){
                msg = "Categorie supprimer avec succès"
            }else{
                msg = "Une erreur s'est produite. La categorie n'a pas pu être supprimer. Veillez réessayer !"
            }
            res.redirect(`/allCategorieDepense?msg=${msg}&tc=text-danger`);
            return
        }catch(_){
            console.error(_);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

module.exports = {
    formAddCategorieDepense,
    allCategorieDepense,
    updateCategorieDepense,
    deleteCategorieDepense,
    addCategorieDepense
}