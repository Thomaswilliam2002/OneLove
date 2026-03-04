const { where, literal } = require('sequelize');
const {Produit,Caisse, Personnel, BarSimple, BarVip, HistSortie, Emballage, CrazyClub, HistCaisse} = require('../../db/sequelize');
const caisse = require('../../models/caisse');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');


allProduitCaisse = (app) => {
    app.get(
        '/allProduitCaisse/:id',
        protrctionRoot,
        authorise('admin', 'comptable', 'caissier', 'gerant'),
        async (req, res) => {
            try {
                const employerId = parseInt(req.params.id);

                if (!employerId) {
                    console.log("ID employer invalide :", req.params.id);
                    return res.redirect('/notFound');
                }

                const caisseAssocier = await Caisse.findAll({
                    where: { id_employer: employerId }
                });

                if (!caisseAssocier || caisseAssocier.length === 0) {
                    console.log("Aucune caisse trouvée pour :", employerId);
                }

                const caissesData = await Promise.all(
                    caisseAssocier.map(async (caisse) => {

                        // 🔒 Sécurisation caisse_of
                        if (!caisse.caisse_of || !caisse.caisse_of.includes('#')) {
                            console.log("Format caisse_of invalide :", caisse.caisse_of);
                            return null;
                        }

                        const parts = caisse.caisse_of.split('#');

                        if (parts.length < 3) {
                            console.log("Découpage incorrect :", caisse.caisse_of);
                            return null;
                        }

                        const [idSource, nomSource, typeSource] = parts;

                        // 🔹 Récupération des entrées
                        const toutesEntrees = await HistSortie.findAll({
                            where: { receveur: nomSource }
                        });

                        let produitsMap = {};
                        let emballagesMap = {};

                        for (const item of toutesEntrees) {

                            if (!item.id_probal) continue;

                            const key = parseInt(item.id_probal);

                            const targetMap =
                                item.type === 'produit'
                                    ? produitsMap
                                    : emballagesMap;

                            if (!targetMap[key]) {
                                targetMap[key] = {
                                    qte_totale: 0,
                                    prix_recent: item.prix_unit,
                                    date: item.created
                                };
                            }

                            targetMap[key].qte_totale += item.quantiter;

                            // mise à jour du prix si plus récent
                            if (new Date(item.created) > new Date(targetMap[key].date)) {
                                targetMap[key].prix_recent = item.prix_unit;
                                targetMap[key].date = item.created;
                            }
                        }

                        // 🔹 Produits
                        let produitsListe = [];

                        for (const id in produitsMap) {

                            const idInt = parseInt(id);

                            const vendus =
                                (await HistCaisse.sum('quantiter', {
                                    where: {
                                        // id_caisse: caisse.id_caisse,
                                        id_probal: idInt,
                                        type: 'produit',
                                        nomBarClub: caisse.caisse_of
                                    }
                                })) || 0;

                            const detail = await Produit.findByPk(idInt);

                            if (detail) {
                                produitsListe.push({
                                    id: detail.id_produit,
                                    nom: detail.nom,
                                    image: detail.image,
                                    prix_unit: produitsMap[id].prix_recent,
                                    qte_dispo:
                                        produitsMap[id].qte_totale - vendus
                                });
                            }
                        }

                        // 🔹 Emballages
                        let emballagesListe = [];

                        for (const id in emballagesMap) {

                            const idInt = parseInt(id);

                            const vendus =
                                (await HistCaisse.sum('quantiter', {
                                    where: {
                                        // id_caisse: caisse.id_caisse,
                                        id_probal: idInt,
                                        type: 'emballage',
                                        nomBarClub: caisse.caisse_of
                                    }
                                })) || 0;

                            const detail = await Emballage.findByPk(idInt);

                            if (detail) {
                                emballagesListe.push({
                                    id: detail.id_emballage,
                                    nom: detail.nom,
                                    prix_unit: emballagesMap[id].prix_recent,
                                    qte_dispo:
                                        emballagesMap[id].qte_totale - vendus
                                });
                            }
                        }

                        return {
                            id_caisse: caisse.id_caisse,
                            nom_caisse: caisse.nom,
                            lieu: nomSource,
                            produits: produitsListe,
                            emballages: emballagesListe
                        };
                    })
                );

                // 🔒 On retire les null éventuels
                const result = caissesData.filter(c => c !== null);

                res.render('produitCaisse', {
                    caisses: result,
                    msg: req.query.msg,
                    id_caissier: employerId
                });

            } catch (error) {
                console.error("ERREUR allProduitCaisse :", error);
                return res.redirect('/notFound');
            }
        }
    );
};

addHistCaisse = (app) => {
    app.post('/addHistCaisse', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) =>{
        const {qte, prix, type, idpro, caisse, barclub, caissier, nom} = req.body;
        let pu = 0
        try{
            const ajoutHist = await HistCaisse.create({
                quantiter: qte,
                prix_unit: prix,
                type: type,
                id_probal: idpro,
                id_caisse: caisse,
                nomBarClub: barclub,
                nom: nom,
                id_caissier: caissier
            })
            if(ajoutHist){
                
                const caisse_ = await Caisse.findByPk(caisse)
                if(caisse_){
                    // let solde = caisse_.solde 
                    let depense = caisse_.depense 
                    let recette = caisse_.recette + (qte * prix)
                    const up = await Caisse.update({
                        solde: recette - depense,
                        recette : recette,
                    },{
                        where: {id_caisse: caisse}
                    })
                }

                res.redirect(`/allProduitCaisse/${caissier}?msg=ajout`)
            }
        }catch (e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
        
    }
)}

allHistCaisse = (app) => {
    app.get(['/allHistCaisse/:id', '/allHistCaisse'], protrctionRoot, authorise('admin', 'comptable', 'caissier', 'gerant'), async (req, res) => {
        try{
            let hist = null;
            if(req.params.id){
                hist = await HistCaisse.findAll({
                    where: {id_caissier: req.params.id}
                })
            }else{
                hist = await HistCaisse.findAll()
            }

            res.status(200).render('allHistCaisse', {hists: hist,msg: req.query.msg})
        }catch(e){
            console.error(e);
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    }
    
)}

deleteHistCaisse = (app) => {
    app.delete('/deleteHistCaisse/:id', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
        HistCaisse.findByPk(req.params.id)
            .then(hist => {
                const histDel = hist;
                HistCaisse.destroy({where: {id_hist: histDel.id_hist}})
                    .then(_ => {
                        Caisse.findByPk(histDel.id_caisse)
                            .then(caisse => {
                                let depense = caisse.depense 
                                let recette = caisse.recette - (histDel.prix_unit * histDel.quantiter)
                                Caisse.update({
                                    solde: recette - depense,
                                    recette : recette,
                                },{
                                    where: {id_caisse: histDel.id_caisse}
                                })
                                    .then(up => {
                                        // console.log(histDel.prix_unit * histDel.quantiter, up, caisse.recette)
                                        res.redirect(`/allHistCaisse/${histDel.id_caissier}?msg=sup`)
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
    }
)}

module.exports = {
    allProduitCaisse,
    addHistCaisse,
    allHistCaisse,
    deleteHistCaisse
}