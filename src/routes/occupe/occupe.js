const {Occupe} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');
//cree la ligne occupe associer au personnel(en gros tel personnel ocupe tel post)
Occupe.create({
    salaire:salaire,
    id_personnel: personnel.id_personnel,
    id_poste: poste
})
    .then(occupe =>{
        res.redirect('/allPersonnel?allType=pas_admin&msg=Personnel ajouter au post avec succes&type=staff');
    })
    .catch(_ => {
        console.error(_);
        res.redirect('/notFound');
        return; // On stoppe tout ici !
    })