"use strict";

// Creating the application namespace
var directory = {
    dao: {},
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
  window.graph;
  window.allTaxonNb;
  window.deferreds = [];
  
  $("body").addClass("ui-disabled");
  $("body").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
  
  initDB();
  directory.utils.templateLoader.load(['profil-page','d3-graph-panel', 'request-panel','gallery-taxon-list', 'gallery-panel', 'home-page', 'search-page', 'taxon-panel', 'taxon-list-item', 'gallery-detail','gallery-page', 'gallery-list-item','play-list-gallery','play-gallery', 'play-gameboard']);

  $.when.apply(null, deferreds).done(function() {
    console.log ('all deferreds finished');
    directory.app = new directory.Router();
    Backbone.history.start();
    /*directory.app.bind("all",function(route, router) {
    console.log("Different Page: " + route);
});*/
    $('#dataloader-img').remove();
    $("body").removeClass("ui-disabled");
  });
}

function initDB(){
  console.log("initBD");
  // Initialisation des données 
  directory.db = openDatabase("meol-taxon", "1.0", "db meol-taxon", 20*1024*1024); // espace accordé à la BD: 20 MO
  initializeDB(directory.db);
  var dfd = $.Deferred();
  deferreds.push(dfd);
  //Test si les données existes
  //Si oui alors => pas de chargement des données en base
  $.when(runQuery("SELECT * FROM Ttaxons" , [])).done(function (dta) {
    console.log(dta.rows.length);
    console.log('Success  test if data are loaded');
    var arr = [];
    if (dta.rows.length == 0 ) {
      arr.push(loadTaxaFile(directory.db));
      arr.push(loadItemsFile(directory.db));
      arr.push(loadGalleryFile(directory.db));
      // Bout de code pourratch pour les tests
      var requete = "INSERT INTO Tprofil (pseudo, avatar) VALUES ('toto', null)";
      arr.push(runQuery(requete, []));
  
    }
   $.when.apply(this, arr).then(function () {
      console.log('when finished dfd.resolve test if data are loaded');
      return  dfd.resolve();
    });
  }).fail(function (err) {
      console.log('Error  test if data are loaded');
      return dfd.resolve();
  });
}
