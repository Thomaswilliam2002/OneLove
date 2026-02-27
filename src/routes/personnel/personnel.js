//const { where } = require('sequelize')
const {Personnel, BarSimple, BarVip, CrazyClub, Caisse} = require('../../db/sequelize') 
const {Poste} = require('../../db/sequelize')
const {Occupe} = require('../../db/sequelize')
const {Sanction} = require('../../db/sequelize')
const occupe = require('../../models/occupe')
const bcrypt = require('bcrypt')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allPersonnel = (app) => {
    app.get('/allPersonnel', protrctionRoot, authorise('admin', 'comptable', 'caissier'), (req, res) => {
        Personnel.findAll({
            order:[['id_personnel', 'DESC']]
        })
            .then(personnels => {
                const msg = "Liste recuperer avec succes"
                res.status(200).render('staff-list', {personnels: personnels, msg: req.query.msg, type:req.query.type, allType: req.query.allType});
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

validation = (app) => {
    app.get(['/validation/:id/:val'], async (req, res) => {
        const upd = await Personnel.update({
            validation: req.params.val
        },{
            where: {id_personnel: req.params.id}
        })
        if(upd){
            res.redirect('/allPersonnel?msg=modif&type=admin');
        }else{
            res.redirect('/notFound');
            return;
        }
    })
}

onePersonnel = (app) => {
    app.get('/onePersonnel/:id', protrctionRoot, authorise('admin', 'comptable', 'caissier', 'caissier central', 'gerant'), (req, res) => {
        Occupe.findOne({
            include:[
                {model:Personnel, where: {id_personnel: req.params.id}},
                {model: Poste},
                {model: Sanction}
            ]
        })
            .then(occupe => {
                // const msg = "personnel recuperer avec succes"
                //res.json({msg, data: occupe})//staff-profil
                if(occupe.Personnel.type_personnel === 'caissier'){
                    Caisse.findAll({
                        where: {id_employer: occupe.Personnel.id_personnel}
                    })
                    .then(caisses => {
                        res.status(200).render('staff-profil', {occupe: occupe, indice: req.query.indice, caisses: caisses});
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
                }else{
                    res.status(200).render('staff-profil', {occupe: occupe, indice: req.query.indice});
                }
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

formAddPersonnel = (app) =>{
    app.get(['/formAddPersonnel', '/inscription'], (req, res) => {
        Poste.findAll()
            .then(postes => {
                BarSimple.findAll()
                    .then(bs => {
                        BarVip.findAll()
                            .then(bv => {
                                CrazyClub.findAll()
                                    .then(cc => {
                                        res.status(200).render('add-staff', {postes: postes,barSimples: bs, barVips: bv, crazycs: cc, indice: req.query.indice, msg: req.query.msg})
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
}

formAddAdmin = (app) =>{
    app.get('/formAddAdmin', protrctionRoot, authorise('admin'), (req, res) => {
        res.status(200).render('add-admin', {msg: req.query.msg})
    })
}

formEditAdmin = (app) =>{
    app.get('/formEditAdmin/:id', protrctionRoot, authorise('admin'), (req, res) => {
        Personnel.findByPk(req.params.id)
            .then(personnel => {
                //console.log(personnel.id_personnel)
                Occupe.findAll({ 
                    include:[
                        {model:Personnel, where: {id_personnel: personnel.id_personnel}},
                        {model: Poste, where: {id_poste: 6}}
                    ]
                })
                .then(occupe => {
                    //res.json(occupe)
                    res.status(200).render('edit-admin', {personnel: personnel, occupe: occupe})
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

formEditPersonnel = (app) =>{
    app.get('/formEditPersonnel/:id', (req, res) => {
        Personnel.findByPk(req.params.id)
            .then(personnel => {
                Poste.findAll()
                .then(postes => {
                    res.status(200).render('edit-staff', {personnel: personnel, postes: postes})
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

addPersonnel = (app) => {
    app.post(['/addPersonnel', '/addAdmin'],async (req, res) => {
        const {nom, prenom, email, mdp, numero, age, selectGenderOptions, poste, dep,  desc, adresse, periode} = req.body;
        
        // On enlève les espaces avant de tester la valeur
        const cleanAge = age?.trim(); 

        const ageData = (cleanAge && !isNaN(cleanAge)) ? parseInt(cleanAge, 10) : 0;

        const verif = await Personnel.findOne({
            where:{email: email}
        })
        if(verif){
            msg = "Cette email existe déjà! Choisisez un autre."
            if(req.path === '/addPersonnel' && req.query.sender === 'admin'){
                res.redirect('/formAddPersonnel?indice=admin&msg=' + msg)
            }else if(req.path === '/addPersonnel' && req.query.sender === 'staff'){
                res.redirect('/inscription?msg=' + msg)
            } else if(req.path === '/addAdmin'){
                res.redirect('/formAddAdmin?msg=' + msg)
            }
            return;
        }

        let postte = poste
        let hash_pass = ''
        let type = 'staff'
        const salt = await bcrypt.genSalt(10);
        hash_pass = await bcrypt.hash(mdp, salt)
        if(req.path === '/addAdmin'){
            const adPoste = await Poste.findOne({
                where:{nom_poste: 'Admin'}
            })
            if(adPoste){
                // console.log(adPoste)
                postte = adPoste.id_poste
                type = 'admin'
            }
        }
        if(req.path === '/addPersonnel'){
            try{
                const post = await Poste.findByPk(poste);
                if(post.nom_poste === 'Comptable'){
                    type = 'comptable'
                }else if(post.nom_poste === 'Caissier Central'){
                    type = 'caissier central'
                }else if(post.nom_poste === 'Caissier'){
                    type = 'caissier'
                }else if(post.nom_poste === 'Gerant'){
                    type = 'gerant'
                }
            }catch (e){
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            }
        }

        Personnel.create({
            nom: nom, 
            prenom: prenom,
            adresse: adresse,
            email: email,
            mdp: hash_pass,
            numero: numero,
            age: ageData,
            genre: selectGenderOptions,
            type_personnel: type,
            description: desc,
            validation: 0,
            periode: periode
        })
            .then(personnel => {
                Poste.findOne({
                    where:{id_poste: postte}
                })
                    .then(poste =>{
                        Occupe.create({
                            salaire:poste.salaire,
                            id_personnel: personnel.id_personnel,
                            id_poste: poste.id_poste
                        })
                            .then(occupe =>{
                                if(req.path === '/addPersonnel' && req.query.sender === 'admin'){
                                    res.redirect('/formAddPersonnel?indice=admin&msg=ajout')
                                }else if(req.path === '/addPersonnel'){
                                    res.redirect('/login')
                                }else if(req.path === '/addAdmin' && req.query.sender === 'admin'){
                                    res.redirect('/formAddAdmin?msg=ajout')
                                }else{

                                }
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

updatePersonnel = (app) => {
    app.put(['/updatePersonnel/:id'], (req, res) => {
        console.log(req.query.type)
        if (req.query.type === 'staff'){
            const {nom, prenom, email, numero, age, selectGenderOptions, qualification, poste, departement, sdepartement, desc, adresse, periode} = req.body;
            Personnel.update({
                nom: nom,
                prenom: prenom,
                adresse: adresse,
                email: email,
                numero: numero,
                age: age,
                genre: selectGenderOptions,
                description: desc,
                periode: periode
            },{
                where: {id_personnel: req.params.id}
            })
                .then(personnel => {
                    Poste.findByPk(poste)
                        .then(poste =>{
                            Occupe.update({
                                salaire:poste.salaire,
                                id_poste: poste.id_poste
                            },{
                                where: {id_personnel: req.params.id}
                            })
                                .then(occupe =>{
                                    res.redirect(`/onePersonnel/${req.params.id}`);
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
        else if(req.query.type === 'admin'){
            const {nom, prenom, email, numero, age, selectGenderOptions, qualification, poste, departement, sdepartement, salaire, desc, adresse} = req.body;
             Personnel.update({
                nom: nom,
                prenom: prenom,
                adresse: adresse,
                email: email,
                numero: numero,
                age: age,
                genre: selectGenderOptions,
                description: desc
            },{
                where: {id_personnel: req.params.id}
            })
                .then(personnel => {
                            Occupe.update({
                                salaire:salaire
                            },{
                                where: {id_personnel: req.params.id}
                            })
                                .then(occupe =>{
                                    res.redirect('/allPersonnel?allType=admin&msg=modif&type=admin');
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

deletePersonnel = (app) => {
    app.delete('/deletePersonnel/:id', protrctionRoot, authorise('admin','comptable', 'caissier', 'caissier central'), (req, res) => {
        Personnel.findByPk(req.params.id)
            .then(personnel => {
                const appartDel = personnel;
                    Occupe.findOne({where: {id_personnel: appartDel.id_personnel}})
                        .then(occcup => {
                            const occuper = occcup
                            Occupe.destroy({where: {id_personnel: occcup.id_personnel}})
                                .then(occcup => {
                                    Personnel.destroy({where: {id_personnel: appartDel.id_personnel}})
                                        .then(_ => { 
                                            if(appartDel.type_personnel === 'pas_admin'){
                                                res.redirect('/allPersonnel?allType=pas_admin&msg=sup&type=staff');
                                            }
                                            else{
                                                res.redirect('/allPersonnel?allType=admin&msg=sup&type=admin');
                                            }
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
                
                
                //     Personnel.destroy({where: {id_personnel: appartDel.id_personnel}})
                //         .then(_ => { 
                //                 res.redirect('/allPersonnel?allType=admin&msg=sup&type=admin');
                //         })
                //         .catch(_ => console.log('erreure de suppression', _))
                // }

                // Personnel.destroy({where: {id_personnel: appartDel.id_personnel}})
                //     .then(_ => { 
                //         if(appartDel.type_personnel === 'pas_admin'){
                //             res.redirect('/allPersonnel?allType=pas_admin&msg=sup&type=staff');
                //         }
                //         else if(appartDel.type_personnel === 'admin'){
                //             res.redirect('/allPersonnel?allType=admin&msg=sup&type=admin');
                //         }
                //     })
                //     .catch(_ => console.log('erreure de suppression', _))
            }).catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

module.exports = {
    allPersonnel,
    onePersonnel,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
    formAddPersonnel,
    formEditPersonnel,
    formAddAdmin,
    formEditAdmin,
    validation
}