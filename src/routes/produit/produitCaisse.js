const { where, literal } = require('sequelize');
const {Produit,Caisse, Personnel, BarSimple, BarVip, HistSortie, Emballage, CrazyClub, HistCaisse} = require('../../db/sequelize');
const caisse = require('../../models/caisse');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allProduitCaisse = (app) => {
    app.get('/allProduitCaisse/:id', protrctionRoot, authorise('admin', 'comptable', 'caissier', 'gerant'), async (req, res) => {
        // res.status(200).render('produitCaisse');
        const caisseAssocier = await Caisse.findAll({
            where: {id_employer: req.params.id}
        })
        // res.json(caisseAssocier);
        const tabbs = []
        const tabbv = []
        const tabcc = []
        const cargcc = []
        const cargbs = []
        const cargbv = []
        const prod = []
        const emba = []
        const hc = []
        if(caisseAssocier && caisseAssocier.length > 0){
            for (const caisse of caisseAssocier){
                if(caisse.caisse_of.split('#')[2] === 'bs'){
                    const bars = await BarSimple.findByPk(caisse.caisse_of.split('#')[0])
                    if(bars){
                        // console.log('ok')
                        tabbs.push(bars);
                    }
                }
                if(caisse.caisse_of.split('#')[2] === 'bv'){
                    const barv = await BarVip.findByPk(caisse.caisse_of.split('#')[0])
                    if(barv){
                        tabbv.push(barv);
                    }
                }
                if(caisse.caisse_of.split('#')[2] === 'cc'){
                    const barc = await CrazyClub.findByPk(caisse.caisse_of.split('#')[0])
                    // console.log(barc)
                    if(barc){
                        tabcc.push(barc);
                    }
                }
            };
            if(tabbs.length > 0){
                for(const bs of tabbs){
                    const hbs = await HistSortie.findAll({
                        where:{receveur: bs.nom}
                    })
                    if(hbs && hbs.length > 0){
                        cargbs.push(...hbs)
                    }
                    
                    for(const hb of hbs){
                        console.log(hb.type)
                        if(hb.type === 'produit'){
                            const pro = await Produit.findByPk(hb.id_probal)
                            if(pro){
                                prod.push(pro)
                            }
                        }else if(hb.type === 'emballage'){
                            const emb = await Emballage.findByPk(hb.id_probal)
                            if(emb){
                                emba.push(emb)
                            }
                        }
                    }
                }
            }
            if(tabbv.length > 0){
                for(const bv of tabbv){
                    const hbv = await HistSortie.findAll({
                        where:{receveur: bv.nom}
                    })
                    if(hbv && hbv.length > 0){
                        cargbv.push(...hbv)
                    }

                    for(const hb of hbv){
                        if(hb.type === 'produit'){
                            const pro = await Produit.findByPk(hb.id_probal)
                            if(pro){
                                prod.push(pro)
                            }
                        }else if(hb.type === 'emballage'){
                            const emb = await Emballage.findByPk(hb.id_probal)
                            if(emb){
                                emba.push(emb)
                            }
                        }
                    }
                }
            }
            if(tabcc.length > 0){
                for(const cc of tabcc){
                    const hcc = await HistSortie.findAll({
                        where:{receveur: cc.nom}
                    })
                    // console.log(hcc)
                    if(hcc && hcc.length > 0){
                        cargcc.push(...hcc)
                    }

                    for(const hc of hcc){
                        if(hc.type === 'produit'){
                            const pro = await Produit.findByPk(hc.id_probal)
                            if(pro){
                                prod.push(pro)
                            }
                        }else if(hc.type === 'emballage'){
                            const emb = await Emballage.findByPk(hc.id_probal)
                            if(emb){
                                emba.push(emb)
                            }
                        }
                    }
                }
            }

            const hist = await HistCaisse.findAll()
            if(hist){
                hc.push(...hist)
                console.log(hc)
            }

            res.status(200).render('produitCaisse', {data: [caisseAssocier, tabbs, tabbv, cargbs, cargbv, prod, emba, tabcc, cargcc], hists: hc, msg: req.query.msg});
            // res.json([caisseAssocier, tabbs, tabbv, cargbs, cargbv, probal]);
        }else{
            // res.json({msg: 'nn'});
            res.status(200).render('produitCaisse', {data: 'null', msg: req.query.msg})
        }
    })
}

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
            console.log(e)
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
            console.log(e)
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
                                    .catch(_ => console.log('erreure de modification', _))
                            })
                            .catch(_ => console.log('erreure de selection', _))
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    }
)}

module.exports = {
    allProduitCaisse,
    addHistCaisse,
    allHistCaisse,
    deleteHistCaisse
}