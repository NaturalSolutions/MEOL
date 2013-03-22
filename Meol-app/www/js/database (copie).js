"use strict";

function chargerListeTaxon(db){
	var requete = "SELECT * FROM Ttaxons";	
	getItems(db, requete, successGenererInterfaceTaxons);	
}

function successGenererInterfaceTaxons (transaction, resultSet){
	var currentRow;
  if (resultSet.rows.length == 0 ) {
    loadTaxaFile(directory.db);
  }
}

function chargerListeGallery(db){
	var requete = "SELECT * FROM Tgallery";	
	getItems(db, requete, successGenererInterfaceGallery);	
}

function successGenererInterfaceGallery (transaction, resultSet){
	var currentRow;
  if (resultSet.rows.length == 0 ) {
    loadGalleryFile(directory.db);
  }
}

function chargerListeItems(db){
	var requete = "SELECT * FROM Titems";	
	getItems(db, requete, successGenererInterfaceItems);	
}

function successGenererInterfaceItems (transaction, resultSet){
	var currentRow;
  if (resultSet.rows.length == 0 ) {
    loadItemsFile(directory.db);
  }
}


// ----------------------------------------------- Disable app during data loading ------------------------------------------ //

function disablePageDuringDataLoading() {
  $("body").addClass("ui-disabled");
  $("body").append("<img id='dataloader-img' src='css/images/ajax-loader.gif'/>");
  countTaxonLoaded();
}

function countTaxonLoaded(){
  directory.db.transaction(
      function(tx) {
          var sql = "SELECT count(*) as count FROM Ttaxons";	
          tx.executeSql(sql, [], countTaxonLoadedHandler);
      },
      function(tx, error) {
          console.log(tx);
      }
  );
}

function countTaxonLoadedHandler(tx, results) {
  var len = results.rows.length,i = 0;
  for (; i < len; i = i + 1) {
    var taxonNb = results.rows.item(i).count;
    if (allTaxonNb !== taxonNb) setTimeout(startLoop(allTaxonNb), 300); 
    else {
      $('#dataloader-img').remove();
      $("body").removeClass("ui-disabled");
    }
  }
}


// ----------------------------------------------- Database Initialisation ------------------------------------------ //
function initializeDB(db){
  try {
    if (db) {
      // creer la table taxons
      var requete = 'CREATE TABLE IF NOT EXISTS Ttaxons (Ttax_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_collectionid  NVARCHAR(200), pageid INTEGER, taxonConceptId INTEGER, taxonName  NVARCHAR(200), flathierarchy text, preferredCommonNames  NVARCHAR(200), textDesc_objectid  NVARCHAR(200), textDesc_title  NVARCHAR(200), textDesc_credits  NVARCHAR(200), textDesc_description text, iucnStatus  NVARCHAR(200), image_objectid  NVARCHAR(200), image_title NVARCHAR(200), image_credits  NVARCHAR(500), image_fileName  NVARCHAR(200))';
      runQueryWithoutParameters(requete);
       // creer la table gallery
      requete = 'CREATE TABLE IF NOT EXISTS Tgallery (Tgallery_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'collectionid  NVARCHAR(200),  name  NVARCHAR(200),  description  NVARCHAR(2000), logo  NVARCHAR(200), level INTEGER)';
      runQueryWithoutParameters(requete);
       // creer la table items
      requete = 'CREATE TABLE IF NOT EXISTS Titems (Titem_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_collectionid INTEGER, object_id INTEGER, pageid INTEGER, type  NVARCHAR(20), taxonConceptId INTEGER, taxonName  NVARCHAR(200),  preferredCommonNames  NVARCHAR(200), iNat  NVARCHAR(200), title  NVARCHAR(200), filename  NVARCHAR(200))';
      runQueryWithoutParameters(requete);
       // creer la table profil et score
      requete = 'CREATE TABLE IF NOT EXISTS Tprofil (Tprofil_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'pseudo  NVARCHAR(50), avatar  NVARCHAR(200), creationDate DATETIME)';
      runQueryWithoutParameters(requete);

      requete = 'CREATE TABLE IF NOT EXISTS Tscore (Tscore_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_profil INTEGER, gameDate DATETIME, nbQuestionTotal INTEGER, nbAnswerGood INTEGER, nbAnswerGoodSequence INTEGER, '
        + 'nbQuestionTotalAfrica INTEGER ,nbQuestionTotalAsia INTEGER ,nbQuestionTotalAntartica INTEGER ,nbQuestionTotalEurope INTEGER ,nbQuestionTotalOceania INTEGER ,nbQuestionTotalAmericaNorth INTEGER ,nbQuestionTotalAmericaSouth INTEGER,'
        + 'nbAnswerGoodAfrica INTEGER ,nbAnswerGoodAsia INTEGER ,nbAnswerGoodAntartica INTEGER ,nbAnswerGoodEurope INTEGER ,nbAnswerGoodOceania INTEGER ,nbAnswerGoodAmericaNorth INTEGER ,nbAnswerGoodAmericaSouth INTEGER )';
      runQueryWithoutParameters(requete);
    }
  } 
  catch (err) { 
   console.log(err);
  }
}
 
 
// ----------------------------------------------- Alimenter la base de données par le contenu des fichiers ressources ------------------------------------------ //
//************************************** Taxons
/*
    var dfd = $.Deferred();
    var arr = [];
    $.getJSON(url, function(json) {
        $.each(json.results, function(i, res) {
            var dfd = $.Deferred();
            arr.push(dfd.promise()); 
            db.transaction(function(tx) {
                tx.executeSql(
                    "INSERT INTO table1 (A, B, C, D) VALUES (?,?,?,?) ", 
                    [res.A, res.B, res.C, res.D], 
                    function(){
                        onSuccess(dfd.resolve);
                    }, 
                    function(){
                        onError(dfd.resolve);
                    }
                );
            });
        });
        $.when.apply(this, arr).then(dfd.resolve);
    });
    return dfd.promise();

*/


 //************************************** Collections
function loadTaxaFile(db){				
	$.ajax( {
    type: "GET",
    url: "data/detail_Taxon.json",
    dataType: "json",
    success: function(json) {
      console.log("loadTaxaFile begin");
      var taxonDetailData = json;
      var i = 0;
      for( var taxid in taxonDetailData) { //Initialise la BD
        var tax = taxonDetailData[taxid]
        var hierarchy = JSON.stringify(tax.flathierarchy);
        var query = "Insert into Ttaxons(fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var param = [tax.collectionid , tax.pageid , tax.taxonConceptId, tax.taxonName ,hierarchy , tax.preferredCommonNames , tax.textDesc_objectid , tax.textDesc_title , tax.textDesc_credits , tax.textDesc_description, tax.iucnStatus , tax.image_objectid , tax.image_title, tax.image_credits , tax.image_fileName ];
        
        deferreds.push(runQueryWithParameters(query, param));
      } 							
			}
  });
 }
 
 //************************************** Collections
function loadGalleryFile(db){				
	$.ajax( {
    type: "GET",
    url: "data/collection_metadata.json",
    dataType: "json",
    success: function(json) {
      var galleryData = json;
      for(var galleryid in galleryData) { //Initialise la BD
        var gal = galleryData[galleryid]
        var query = "Insert into  Tgallery (collectionid, name,  description, logo, level) values(?,?,?,?, ?)";
        var param = [galleryid , gal.name , gal.description, gal.logo, gal.level];
        deferreds.push(runQueryWithParameters(query, param));
      } 							
			}
  });
 }
 
 //************************************** Items
function loadItemsFile(db){				
	$.ajax( {
    type: "GET",
    url: "data/items.json",
    dataType: "json",
    success: function(json) {
      var items = json;
      for(var itemid in items) { //Initialise la BD
        var it = items[itemid]
        var query = "Insert into  Titems (fk_collectionid, object_id, pageid, type, taxonConceptId, taxonName, preferredCommonNames, iNat, title, filename) values(?,?,?,?,?,?,?,?,?,?)";
        var param = [it.fk_collection , it.pageid , it.pageid, it.type, it.taxonConceptId, it.taxonName, it.common_name , it.iNat , it.title, it.filename];
        deferreds.push(runQueryWithParameters(query, param));
      } 							
			}
  });
 }
 
// ----------------------------------------------- Utilitaire de requêtes------------------------------------------ //


function runQueryWithoutParameters(query){
	return $.Deferred(function(dfd) {
    directory.db.transaction (function (trxn) {
      trxn.executeSql(
        query, //requete à executer
        []  // parametres de la requete
      )},
      function (transaction, error){  //error callback
        dfd.reject(arguments);
      },
      function (transaction, resultSet){  //success callback
        console.log('query resolved!');
        dfd.resolve(arguments);
      }
    );
  }).done(function(transaction, resultSet) {
    console.log('success');
  }).reject(function(transaction, error) {
    console.log('error');
    console.log(error);
  }).promise();
}


function getItems(db, query, queryCallback){
	db.transaction(function(tx){
				tx.executeSql(query,[], queryCallback);
	});
}

function runQueryWithParameters(query, parametres){
  console.log('hgjhgvkjhgjh');
  var dfd = $.Deferred(function(dfd) {
    directory.db.transaction (function (trxn) {
      trxn.executeSql(
        query, //requete à executer
        parametres, // parametres de la requete
        function (transaction, resultSet){  //success callback
          console.log('query with params resolved!');
          dfd.resolve(arguments);
        },
        function (transaction, error){  //error callback
          dfd.reject(arguments);
        }
      )}
    );
  });
  dfd.resolve(function() {
    //console.log('dfd resolve ');
  });
  dfd.done(function() {
    //console.log('dfd done ');
  });
  dfd.reject(function() {
    //console.log('dfd reject ');
    console.log(error);
  });
  return dfd.promise();
}
