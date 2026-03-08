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
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addHSortie = (app) => {
    app.post('/addHSortie/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {

        try {

            const { nbr, prix, type, idpro, dest, cmm } = req.body;
            const art = req.query.art;
            const [desti, type_lieu, id_caisse] = dest.split('|');
            let model;
            let idField;
            let redirectUrl;

            if (art === 'produit') {
                model = Produit;
                idField = 'id_produit';
                redirectUrl = '/allProduit?msg=Produit envoye avec succes&tc=alert-success'; 
            }

            if (art === 'emballage') {
                model = Emballage;
                idField = 'id_emballage';
                redirectUrl = '/allEmballage?msg=Emballage envoye avec succes&tc=alert-success';
            }
            
            const article = await model.findByPk(req.params.id);

            if (!article) {
                return res.redirect('/notFound');
            }

            const q = article.quantiter;

            await HistSortie.create({
                quantiter: nbr,
                prix_unit: prix,
                type: type,
                id_probal: idpro,
                receveur: desti,
                type_lieu_receveur: type_lieu,
                commantaire: cmm,
                id_caisse: id_caisse
            });

            await model.update({
                quantiter: parseInt(q) - parseInt(nbr)
            }, {
                where: {
                    [idField]: article[idField]
                }
            });

            res.redirect(redirectUrl);

        } catch (error) {
            console.error(error);
            res.redirect('/notFound');
        }

    });
}
const deleteHSortie = (app) => {
    app.delete('/deleteHSortie/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try {
            // 1. Trouver l'historique
            const hvente = await HistSortie.findByPk(req.params.id);
            
            if (!hvente) {
                return res.redirect('/notFound');
            }

            // 2. Mise à jour du stock selon le type
            if (hvente.type === 'produit') {
                const produit = await Produit.findByPk(hvente.id_probal);
                if (produit) {
                    await Produit.update(
                        { quantiter: produit.quantiter + hvente.quantiter },
                        { where: { id_produit: produit.id_produit } }
                    );
                }
            } else if (hvente.type === 'emballage') {
                const emballage = await Emballage.findByPk(hvente.id_probal);
                if (emballage) {
                    await Emballage.update(
                        { quantiter: emballage.quantiter + hvente.quantiter },
                        { where: { id_emballage: emballage.id_emballage } }
                    );
                }
            }

            // 3. Supprimer l'historique après la mise à jour du stock
            await HistSortie.update({ is_active: false }, { where: { id_hist: hvente.id_hist } });

            // 4. Redirection finale
            if (hvente.type === 'produit') {
                return res.redirect(`/oneProduit/${req.query.id}?msg=Historique supprimer avec succes&tc=alert-success&type=vente`);
            } else {
                return res.redirect(`/oneEmballage/${req.query.id}?msg=Historique supprimer avec succes&tc=alert-success&type=vente`);
            }

        } catch (error) {
            console.error("Erreur deleteHSortie:", error);
            return res.redirect('/notFound');
        }
    });
};

module.exports = {
    allHSortie,
    addHSortie,
    deleteHSortie
}