const exceljs = require('exceljs')
const path = require('path');

// address - B8 - column; 
// value - "";
// row - 8 - ligne
//fonction pour selectionner une plage de cellule
const plage = (sheet, d, f) => {
    sheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, column) => {
            if(rowNumber >= d && rowNumber <= f && column >= d && column <= f){
                console.log(`Cellule (${rowNumber}, ${column}): ${cell.value}`)
            }
        })
    });
}

//fonction pour selectionner une ligne entiere
const ligne = (sheet, r) => {
    const row = sheet.getRow(r)
    row.eachCell((cell, column) => {
        console.log(`Cellule (${row.number}, ${column}): ${cell.value}`)
    })
}

//fonction pour selectionner une colonne entiere
const colonne = (sheet, c) => {
    sheet.eachRow((row, rowNumber) => {
        const cell = row.getCell(c)
        console.log(`Cellule (${rowNumber}, ${c}): ${cell.value}`)
    })
}
const pathe = 'PERSONNEL ONE LOVE.xlsx'
const workBook = new exceljs.Workbook();
workBook.xlsx.readFile(pathe)
    .then(() => {
        const worksheet = workBook.getWorksheet("PERSONNEL");
        colonne(worksheet, 8)
        //ligne(worksheet, 8)
        //plage(worksheet, 8, 16)
        // const cell = worksheet.getCell(8, 2)
        // console.log(cell.row)
    })

console.log("oi")