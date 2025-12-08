const {Occupent} = require('../../db/sequelize')
const occupent = require('../../models/occupent')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

AddOccupent = (app) => {
    app.post('/AddOccupent', async (req, res) => {
        const {nom, tel, mclose, chambre, date, com} = req.body
        try{
            const occ = await Occupent.create({
                nom_prenom: nom,
                numero: tel,
                id_mclose: mclose,
                id_chambre: chambre,
                date_arriver: date,
                commentaire: com
            })
            if(occ){
                res.redirect('/oneChambre/' + chambre + '/' + mclose)
            }else{
                res.redirect('/notFound')
            }
        }catch(e){
            console.log(e)
            res.redirect('/notFound')
        }
    })
}

deleteOccupent = (app) => {
    app.delete('/deleteOccupent/:id/:mclose/:chambre', (req, res) => {
        Occupent.findByPk(req.params.id)
            .then(occupent => {
                const appartDel = occupent;
                Occupent.destroy({where: {id_occup: appartDel.id_occup}})
                    .then(_ => {
                        res.redirect('/oneChambre/' + req.params.chambre + '/' + req.params.mclose)
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    AddOccupent,
    deleteOccupent
}