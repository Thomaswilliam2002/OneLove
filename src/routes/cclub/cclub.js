const {CrazyClub, CrazyClubJournal, sequelize} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allCClub = (app) => {
    app.get('/allBarV', (req, res) => {
        BarVip.findAll({
            where: {is_active: true},
            order:[['id_cclub', 'DESC']]
        })
            .then(cclubs => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: cclubs})
                res.redirect('all-Bar-club', {cclubs: cclubs, type: req.query.type, msg: req.query.msg})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

oneCClub = (app) => {
    app.get('/oneCClub/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        CrazyClub.findByPk(req.params.id)
            .then(cclub => {
                const msg = "Bar recuperer avec succes"
                res.json({msg, data: cclub})
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addCClub = (app) => {
    app.post('/addCClub', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, adresse} = req.body;
        CrazyClub.create({
            nom: nom,
            adresse: adresse,
        })
            .then(cclub => {
                //const msg = "le Bar  VIP" + req.body.name + "a ete ajouter avec succes"
                //res.json({msg, data: barS})
                res.redirect('/allBarClub?type=crazyc&msg=Crazy Club ajouter avec succes&tc=alert-success')  
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

updateCClub = (app) => {
    app.put('/updateCClub/:id', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {nom, adresse} = req.body;
        CrazyClub.update({
            nom: nom,
            adresse: adresse,
        }, {
            where: {id_cclub: req.params.id}
        })
            .then(_ => {
                // const msg = "Modification du bar avec succes"
                // res.json({msg})
                res.redirect('/allBarClub?type=crazyc&msg=Modification du Crazy Club avec succes&tc=alert-success')
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

deleteCClub = (app) => {
    app.delete('/deleteCClub/:id', protrctionRoot, authorise('admin', 'comptable'), protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const t = await sequelize.transaction();
        
            // update retourne un tableau
            const [logicDel] = await CrazyClub.update(
                { is_active: false },
                { where: { id_cclub: req.params.id}, transaction: t }
            )
        
            // desactiver toute l'historique du bar
            await CrazyClubJournal.update(
                { is_active: false },
                { where: { id_cclub: req.params.id, is_active: true  }, transaction: t }
            )
        
            await t.commit();
        
            if (logicDel > 0) {
                return res.redirect('/allBarClub?type=bars&msg=Crazy Club supprimé avec succès&tc=alert-danger')
            } else {
                return res.redirect('/allBarClub?type=bars&msg=Crazy Club introuvable&tc=alert-warning')
            }
        
        }
        catch(e){
            console.error(e);
            await t.rollback();
            res.redirect('/notFound');
            return;
        }
    })
}

module.exports = {
    allCClub,
    oneCClub,
    addCClub,
    updateCClub,
    deleteCClub
}