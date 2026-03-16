// Basic DataTable
$(function () {
  $("#basicExample").DataTable({
    lengthMenu: [
      [5, 10, 12, 25, 50],
      [5, 10, 12, 25, 50, "All"],
    ],
    language: {
      lengthMenu: "Afficher _MENU_ Enregistrement par Page", //"Display _MENU_ Records Per Page"
      info: "Projection de la page _PAGE_ sur _PAGES_", //Showing Page _PAGE_ of _PAGES_
    },
  });
});

// Vertical Scroll
$(function () {
  $("#scrollVertical").DataTable({
    scrollY: "250px",
    scrollCollapse: true,
    paging: false,
    bInfo: false,
  });
});

// Highlighting rows and columns
$(function () {
  $("#highlightRowColumn").DataTable({
    lengthMenu: [
      [5, 10, 25, 50],
      [5, 10, 25, 50, "All"],
    ],
    language: {
      lengthMenu: "Display _MENU_ Records Per Page",
    },
  });
  var table = $("#highlightRowColumn").DataTable();
  $("#highlightRowColumn tbody").on("mouseenter", "td", function () {
    var colIdx = table.cell(this).index().column;
    $(table.cells().nodes()).removeClass("highlight");
    $(table.column(colIdx).nodes()).addClass("highlight");
  });
});

// Using API in callbacks
$(function () {
  $("#apiCallbacks").DataTable({
    lengthMenu: [
      [10, 25, 50],
      [10, 25, 50, "All"],
    ],
    language: {
      lengthMenu: "Display _MENU_ Records Per Page",
    },
    initComplete: function () {
      var api = this.api();
      api.$("td").on("click", function () {
        api.search(this.innerHTML).draw();
      });
    },
  });
});

// Hiding Search and Show entries
$(function () {
  $("#hideSearchExample").DataTable({
    lengthMenu: [
      [10, 25, 50],
      [10, 25, 50, "All"],
    ],
    searching: false,
    language: {
      lengthMenu: "Display _MENU_ Records Per Page",
      info: "Showing Page _PAGE_ of _PAGES_",
    },
  });
});

// Print Export Copy PDF Buttons
const exportTitle = 'Données extrait depuis le site officiel de Onelove';
$(function () {
  $("#customButtons").DataTable({
    lengthMenu: [
      [10, 25, 50],
      [10, 25, 50, "All"],
    ],
    dom: "Bfrtip",
    // buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
    buttons: [
      {
        extend: 'excel',
        title: exportTitle,
        exportOptions: {
          columns: ':visible' // n'exporte que les colonnes visibles
        }
      },
      {
        extend: 'pdf',
        title: exportTitle,
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'csv',
        title: exportTitle,
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'copy',
        title: exportTitle,
        exportOptions: {
          columns: ':visible'
        }
      },
      {
        extend: 'print',
        title: exportTitle,
        exportOptions: {
          columns: ':visible'
        }
      },
    'colvis'
    ]
  });
});

// Print Export Copy PDF Buttons
// $(function () {
//   $(".customButtone").DataTable({
//     lengthMenu: [
//       [10, 25, 50],
//       [10, 25, 50, "All"],
//     ],
//     dom: "Bfrtip",
//     // buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
//     buttons: [
//       {
//         extend: 'excel',
//         title: exportTitle,
//         exportOptions: {
//           columns: ':visible' // n'exporte que les colonnes visibles
//         }
//       },
//       {
//         extend: 'pdf',
//         title: exportTitle,
//         exportOptions: {
//           columns: ':visible'
//         }
//       },
//       {
//         extend: 'csv',
//         title: exportTitle,
//         exportOptions: {
//           columns: ':visible'
//         }
//       },
//       {
//         extend: 'copy',
//         title: exportTitle,
//         exportOptions: {
//           columns: ':visible'
//         }
//       },
//       {
//         extend: 'print',
//         title: exportTitle,
//         exportOptions: {
//           columns: ':visible'
//         }
//       }, 'colvis'
//     ]
//   });
//   // $(".customButtone").DataTable({
//   //   lengthMenu: [
//   //     [10, 25, 50],
//   //     [10, 25, 50, "All"],
//   //   ],
//   //   dom: "Bfrtip",
//   //   buttons: ["copy", "csv", "excel", "pdf", "print"],
//   // });
// });

$(function () {
  $(".customButtone").each(function () {
    // On récupère le sous-titre dynamique depuis l'attribut data
    var dynamicSubtitle = $(this).data("export-subtitle") || "";
    $(this).DataTable({
      lengthMenu: [
        [10, 25, 50],
        [10, 25, 50, "All"],
      ],
      dom: "Bfrtip",
      buttons: [
        {
          extend: 'excel',
          title: exportTitle,
          exportOptions: { columns: ':visible' }
        },
        {
          extend: 'pdf',
          title: exportTitle, // TITRE FIXE
          messageTop: dynamicSubtitle,      // SOUS-TITRE DYNAMIQUE
          exportOptions: { columns: ':visible' },
          orientation: 'portrait',
          customize: function (doc) {
            // --- Ta logique de personnalisation ---
            const colCount = doc.content[1].table.body[0].length;
            
            if (colCount > 7) {
              doc.pageOrientation = 'landscape';
            }

            // Important : Avec messageTop, le tableau passe à l'index [2] du contenu
            // On vérifie où se trouve le tableau pour ne pas casser le code
            var tableContent = doc.content.find(c => c.table);
            if (tableContent) {
                tableContent.table.widths = Array(colCount).fill('*');
                tableContent.table.headerRows = 1;
                tableContent.table.dontBreakRows = true;
            }

            // Style du sous-titre (messageTop)
            doc.styles.message = {
              fontSize: 12,
              italic: true,
              alignment: 'center',
              margin: [0, 0, 0, 12] // Marge basse pour décoller du tableau
            };

            // Alignements des cellules
            doc.styles.tableBodyEven.alignment = 'center';
            doc.styles.tableBodyOdd.alignment = 'center';
            doc.styles.tableHeader.alignment = 'center';
          }
        },
        {
          extend: 'csv',
          title: exportTitle,
          exportOptions: { columns: ':visible' }
        },
        {
          extend: 'copy',
          title: exportTitle,
          exportOptions: { columns: ':visible' }
        },
        {
          extend: 'print',
          title: exportTitle,
          exportOptions: { columns: ':visible' }
        },
        'colvis'
      ]
    });
  });
});


// Print Export Copy PDF Buttons
$(function () {
  $("#customButtonss").DataTable({
    lengthMenu: [
      [10, 25, 50],
      [10, 25, 50, "All"],
    ],
    dom: "Bfrtip",
    buttons: ["copy", "csv", "excel", "pdf", "print"],
  });
});

// Toggle Buttons
$(function () {
  $("#toggleButtons").DataTable({
    dom: "Bfrtip",
    buttons: ["columnsToggle"],
  });
});

// Space between buttons
$(function () {
  $("#spaceButtons").DataTable({
    dom: "Bfrtip",
    buttons: [
      "copy",
      "print",
      {
        extend: "spacer",
        style: "bar",
        text: "export files",
      },
      "csv",
      "excel",
      "spacer",
      "pdf",
    ],
  });
});

// Appoiuntments
$(function () {
  $("#noBInfo").DataTable({
    bInfo: false,
    paging: false,
    "ordering": false,
  });
});

// Attandance Vertical Scroll
$(function () {
  $("#attandance").DataTable({
    scrollCollapse: true,
    paging: false,
    bInfo: false,
    "ordering": false,
  });
});

// staffLeaves Vertical Scroll
$(function () {
  $("#staffLeaves").DataTable({
    scrollCollapse: true,
    paging: false,
    bInfo: false,
    "ordering": false,
  });
});

// Appoiuntments
$(function () {
  $("#appointmentsGrid").DataTable({
    bInfo: false,
    paging: false,
    "ordering": false,
  });
});