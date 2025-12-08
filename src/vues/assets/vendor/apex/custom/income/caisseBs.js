alert('ok')
document.addEventListener("DOMContentLoaded", function(){
const containe =  document.getElementById('p');
//const recette = JSON.parse(containe.dataset);
const recette = window.DATA_RECETTE;
alert(recette)
console.log(recette)
})
traduct = (date) => {
    const dates = new Date(`${date.split('-')[0]}-${date.split('-')[1]}-01`);
    const shortMonth = dates.toLocaleString('en-US', {month: 'short'});
    return shortMonth;
}

/* <div class="chart-height-lg">
    <div id="apex"></div>
</div> */

// const nb_bs = []

// recette.forEach(element => {
//     for(let i = 0; i < nb_bs.length; i++){
//         if(!nb_bs[i]){
//             nb_bs.push(element.id_barSimple)
//         }else if(nb_bs[i] !== element.id_barSimple){
//             nb_bs.push(element.id_barSimple)
//         }
//     }
    
// });

console.log(nb_bs)

// const all_total = []
//       const text_colore = ['text-primary', 'text-info', 'text-danger', 'text-warning', 'text-success']
//       const class_colore = ['badge bg-primary', 'badge bg-info', 'badge bg-danger', 'badge bg-warning', 'badge bg-success']
        
//         const p = document.getElementById('p');
//         const all_month = document.querySelectorAll('.mois');
//         const diagram = document.getElementById('diagram');

//         const data = JSON.parse('<%- JSON.stringify(all_recette) %>'); 
//         const dep = ['Bar Simple', 'Bar Vip', 'Appartement', 'Cuisine', 'Maison close']
//         for(let i = 0; i < data.length; i++){
//           const ref = Array(12).fill('-');
//           let total = 0
//           for(let k = 0; k < data[i].length; k++){
//             for(let j = 0; j < all_month.length; j++){
//               console.log(data[i][k].mois, all_month[j].innerHTML)
//                 if(traduct(data[i][k].mois) === all_month[j].innerHTML){
//                   ref[j]=data[i][k].total_recette
//                   total = total + parseInt(data[i][k].total_recette)
//                   console.log('oui')
//                 }else{
//                   if(ref[j] === '-'){
//                     ref[j] = '-'
//                   }
//                   console.log('nom')
//                 }
//             }
//             console.log(ref)
//             console.log(typeof ref[4])
//           }
//           if(ref.length === 12){
//             diagram.insertAdjacentHTML('beforeend',`
//               <div class="d-flex align-items-center box-shadow px-3 py-1 rounded-2">
//                 <i class="ri-pie-chart-2-fill ${text_colore[i]} fs-4"></i>
//                 <span class="me-1 fw-semibold ps-1">${total} FCFA</span>
//                 <span class="${text_colore[i]}">Total ${dep[i]}</span>
//               </div>
//             `)
//             p.insertAdjacentHTML('beforeend',`
//               <tr>
//                 <td><span class="${class_colore[i]}">${dep[i]}</span></td>
//                 <td>${ref[0]}</td>
//                 <td>${ref[1]}</td>
//                 <td>${ref[2]}</td>
//                 <td>${ref[3]}</td>
//                 <td>${ref[4]}</td>
//                 <td>${ref[5]}</td>
//                 <td>${ref[6]}</td>
//                 <td>${ref[7]}</td>
//                 <td>${ref[8]}</td>
//                 <td>${ref[9]}</td>
//                 <td>${ref[10]}</td>
//                 <td>${ref[11]}</td>
//                 <td>${total}</td>
//               </tr>
//             `)
//           }
//         }