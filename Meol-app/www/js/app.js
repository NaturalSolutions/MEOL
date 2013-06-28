"use strict";

// Creating the application namespace
var directory = {
    config: {
            // Find pathname portion of the URL and clean it (remove trailing slash if any)
            root: window.location.pathname.replace(/\/(?:index.html)?$/, '')
        },
    dao: {},
    data: {},
    models: {},
    views: {},
    utils: {}
};

// ----------------------------------------------- The Application initialisation ------------------------------------------ //

$().ready(function() {
  init();
}) ;

function init(){

  // document.addEventListener("deviceready", phoneReady, false);
  window.heightScreen = $(window).height();
  window.widthScreen = $(window).width();
  window.deferreds = [];
  
  $("body").addClass("ui-disabled");
  $("body").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
  
  initDB();
  directory.utils.templateLoader.load(['feedback-page','credit-page','profil-page','profil-table','d3-graph-panel', 'request-panel','gallery-taxon-list', 'gallery-panel', 'home-page', 'search-page', 'taxon-panel', 'taxon-list-item', 'gallery-detail','gallery-page', 'gallery-list-item','play-list-gallery','play-gallery', 'play-gameboard']);

  $.when.apply(null, deferreds).done(function() {
    directory.data.galleriesList = new directory.models.GalleriesCollection();
    directory.data.galleriesList.fetch({
        success: function(data) {      
            directory.app = new directory.Router();
            Backbone.history.start();
            $('#dataloader-img').remove();
            $("body").removeClass("ui-disabled");
        }
    });
  });
}

function initDB(){
  // Initialisation des données 
  directory.db = openDatabase("meol-taxon", "1.0", "db meol-taxon", 20*1024*1024); // espace accordé à la BD: 20 MO
  initializeDB(directory.db);
  var dfd = $.Deferred();
  deferreds.push(dfd);
  //Test si les données existes
  //Si oui alors => pas de chargement des données en base
  $.when(runQuery("SELECT * FROM Ttaxons" , [])).done(function (dta) {
    var arr = [];
    if (dta.rows.length == 0 ) {
      arr.push(loadTaxaFile(directory.db));
      arr.push(loadItemsFile(directory.db));
      arr.push(loadGalleryFile(directory.db));
      //Insert unser
      var requete = "INSERT INTO Tprofil (pseudo, avatar) VALUES ('Player 1', null)";
      arr.push(runQuery(requete, []));
  
    }
   $.when.apply(this, arr).then(function () {
      return  dfd.resolve();
    });
  }).fail(function (err) {
      return dfd.resolve();
  });
}
