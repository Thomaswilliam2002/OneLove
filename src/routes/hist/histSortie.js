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
                                    res.redirect('/allProduit?type=Produit envoyé avec succes&tc=alert-success&msg=ajout')
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
                                    res.redirect('/allEmballage?type=emballage envoyé avec succes&tc=alert-success&msg=ajout')
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
        }
    })
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