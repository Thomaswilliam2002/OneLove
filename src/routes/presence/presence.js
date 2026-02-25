const e = require('express');
const {Presence, Personnel} = require('../../db/sequelize');
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

addPresence = (app) => {
    app.post('/addPresence/:id/:idUser', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
        const {date, hd, hf, da} = req.body;
        let depart_enticipe = 'non'
        if(da){
            depart_enticipe = 'oui'
        }
        const personnel = await Personnel.findByPk(req.params.id);
        if(personnel){
            const presence = await Presence.create({
                date: date,
                heure_arriver: hd,
                heure_deppart: hf,
                justification_absence: '',
                etat_presence: 'Present',
                depart_enticiper: depart_enticipe,
                description: '',
                id_personnel: req.params.id,
                pointeur: req.params.idUser
            })
            if(presence){
                res.redirect('/presence?msg=Presence maquer pour ' + personnel.nom + ' ' + personnel.prenom + '&type=presence')
            }
        }else{
            res.redirect('/notFound');
            return
        }
    })
}

addAbsence = (app) => {
    app.post('/addAbsence/:id/:idUser', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
        const {date,hd, hf, just} = req.body;
        let ndate = new Date(date);
        const flag = false;
        //console.log(ndate.toISOString())
        const personnel = await Personnel.findByPk(req.params.id);
        if(personnel){
            const presence = await Presence.findOne({
                where: {date: ndate.toISOString(), id_personnel: req.params.id}
            })
            //console.log(presence)
            if(presence){
                if(presence.heure_arriver >= hd && presence.heure_deppart <= hf){
                    res.redirect('/presence?msg=' + personnel.nom + ' ' + personnel.prenom  + '&type=existe')
                }else{
                    const absence = await Presence.create({
                        date: date,
                        heure_arriver: hd,
                        heure_deppart: hf,
                        justification_absence: just,
                        etat_presence: 'Absent',
                        depart_enticiper: '',
                        description: just,
                        id_personnel: req.params.id,
                        pointeur: req.params.idUser
                    })
                    if(absence){
                        res.redirect('/presence?msg=Absence maquer pour ' + personnel.nom + ' ' + personnel.prenom  + '&type=absence')
                    }
                }
            }else{
                const absence = await Presence.create({
                    date: date,
                    heure_arriver: hd,
                    heure_deppart: hf,
                    justification_absence: just,
                    etat_presence: 'Absent',
                    depart_enticiper: '',
                    description: just,
                    id_personnel: req.params.id,
                    pointeur: req.params.idUser
                })
                if(absence){
                    res.redirect('/presence?msg=Absence maquer pour ' + personnel.nom + ' ' + personnel.prenom  + '&type=absence')
                }else{
                    res.redirect('/notFound');
                    return
                }
            }
            
        }
    })
}

allPresence = (app) => {
    app.get('/allPresence', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
        const histps = await Presence.findAll({
            where: {etat_presence: 'Present'},
            include:[
                {model: Personnel}
            ],
            order:[['id_presence', 'DESC']]
        })
        if(histps){
            res.status(200).render('histPresence', {histps: histps, indice: req.query.indice})
        }else{
            const msg = 'Historique de présence vide.'
            res.status(200).render('histPresence', {msg: msg})
        }
    })
}

allAbsence = (app) => {
    app.get('/allAbsence', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
        const histas = await Presence.findAll({
            where: {etat_presence: 'Absent'},
            include:[
                {model: Personnel}
            ]
        })
        if(histas){
            res.status(200).render('histAbsence', {histas: histas, indice: req.query.indice})
        }else{
            const msg = 'Historique d\'absence vide.'
            res.status(200).render('histAbsence', {msg: msg})
        }
    })
}

deletePresence = (app) => {
    app.delete('/deletePresence/:id', protrctionRoot, authorise('admin', 'comptable', 'caissier'), (req, res) => {
        Presence.findByPk(req.params.id)
            .then(presence => {
                const appartDel = presence;
                Presence.destroy({where: {id_presence: appartDel.id_presence}})
                    .then(_ => {
                        if(req.query.etat === 'present'){
                            res.redirect('/allPresence?indice=pas_admin')
                        }else{
                            res.redirect('/allAbsence?indice=pas_admin')
                        }
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
    })
}

module.exports = {
    addPresence,
    addAbsence,
    allPresence,
    allAbsence,
    deletePresence
}