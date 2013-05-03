"use strict";

// ----------------------------------------------- Database Initialisation ------------------------------------------ //
function initializeDB(db){
  try {
    if (db) {
      // creer la table taxons
      var query = 'CREATE TABLE IF NOT EXISTS Ttaxons (Ttax_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_collectionid  NVARCHAR(200), pageid INTEGER, taxonConceptId INTEGER, taxonName  NVARCHAR(200), flathierarchy text, preferredCommonNames  NVARCHAR(200), textDesc_objectid  NVARCHAR(200), textDesc_title  NVARCHAR(200), textDesc_credits  NVARCHAR(200), textDesc_description text, iucnStatus  NVARCHAR(200), image_objectid  NVARCHAR(200), image_title NVARCHAR(200), image_credits  NVARCHAR(500), image_fileName  NVARCHAR(200))';
      deferreds.push(runQuery(query , []));
       // creer la table gallery
      query = 'CREATE TABLE IF NOT EXISTS Tgallery (Tgallery_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'collectionid  NVARCHAR(200),  name  NVARCHAR(200),  description  NVARCHAR(2000), logo  NVARCHAR(200), level INTEGER, ordre INTEGER, active NVARCHAR(10))';
      deferreds.push(runQuery(query , []));
       // creer la table items
      query = 'CREATE TABLE IF NOT EXISTS Titems (Titem_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_collectionid INTEGER, object_id INTEGER, pageid INTEGER, weightIucn INTEGER, weightContinent INTEGER, type  NVARCHAR(20), taxonConceptId INTEGER, taxonName  NVARCHAR(200),  preferredCommonNames  NVARCHAR(200), iNat  NVARCHAR(200), title  NVARCHAR(200), filename  NVARCHAR(200))';
      deferreds.push(runQuery(query , []));
       // creer la table profil et score
      query = 'CREATE TABLE IF NOT EXISTS Tprofil (Tprofil_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'pseudo  NVARCHAR(50), avatar  NVARCHAR(200),email  NVARCHAR(80), creationDate DATETIME)';
      deferreds.push(runQuery(query , []));

      query = 'CREATE TABLE IF NOT EXISTS Tscore (Tscore_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
        + 'fk_profil INTEGER, fk_gallery INTEGER, gameDate DATETIME, nbQuestionTotal INTEGER, nbAnswerGood INTEGER, nbAnswerGoodSequence INTEGER, score INTEGER'
        + 'nbQuestionTotalAfrica INTEGER ,nbQuestionTotalAsia INTEGER ,nbQuestionTotalAntartica INTEGER ,nbQuestionTotalEurope INTEGER ,nbQuestionTotalOceania INTEGER ,nbQuestionTotalAmericaNorth INTEGER ,nbQuestionTotalAmericaSouth INTEGER,'
        + 'nbAnswerGoodAfrica INTEGER ,nbAnswerGoodAsia INTEGER ,nbAnswerGoodAntartica INTEGER ,nbAnswerGoodEurope INTEGER ,nbAnswerGoodOceania INTEGER ,nbAnswerGoodAmericaNorth INTEGER ,nbAnswerGoodAmericaSouth INTEGER )';
      deferreds.push(runQuery(query , []));
    }
  } 
  catch (err) { 
   console.log(err);
  }
}
 
 
 //************************************** Collections
function loadTaxaFile(db){
console.log('loadTaxaFile');		
 var dfd = $.Deferred();
  var arr = [];
  $.getJSON('data/detail_Taxon.json', function(json) {
      $.each(json, function(taxid, tax) {
          var hierarchy = JSON.stringify(tax.flathierarchy);
          var query = "Insert into Ttaxons(fk_collectionid , pageid , taxonConceptId, taxonName , flathierarchy, preferredCommonNames , textDesc_objectid , textDesc_title , textDesc_credits , textDesc_description, iucnStatus , image_objectid , image_title, image_credits , image_fileName ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
          var param = [tax.collectionid , tax.pageid , tax.taxonConceptId, tax.taxonName ,hierarchy , tax.preferredCommonNames , tax.textDesc_objectid , tax.textDesc_title , tax.textDesc_credits , tax.textDesc_description, tax.iucnStatus , tax.image_objectid , tax.image_title, tax.image_credits , tax.image_fileName ];
          arr.push(runQuery(query , param) ); 
      });
      $.when.apply(this, arr).then(function () {
        console.log('when finished dfd.resolve loadTaxaFile');
        return  dfd.resolve();
        
      });
  });
  return dfd.promise();
}
 
 //************************************** Gallery
function loadGalleryFile(db){	
console.log('loadGalleryFile');			
 var dfd = $.Deferred();
  var arr = [];
  $.getJSON('data/collection_metadata.json', function(json) {
      $.each(json, function(galleryid, gal) {
        var query = "Insert into  Tgallery (collectionid, name,  description, logo, level, ordre, active) values(?,?,?,?,?,?,?)";
        var param = [galleryid , gal.name , gal.description, gal.logo, gal.level, gal.ordre, gal.active];
        arr.push(runQuery(query , param) ); 
      });
      $.when.apply(this, arr).then(function () {
        console.log('when finished dfd.resolve loadGalleryFile');
        return  dfd.resolve();
        
      });
  });
  return dfd.promise();
}
 
 //************************************** Items
function loadItemsFile(db){	
console.log('loadItemsFile');					
  var dfd = $.Deferred();
  var arr = [];
  $.getJSON('data/items.json', function(json) {
      $.each(json, function(itemid, it) {
        var query = "Insert into  Titems (fk_collectionid, object_id, pageid, weightIucn, weightContinent,type, taxonConceptId, taxonName, preferredCommonNames, iNat, title, filename) values(?,?,?,?,?,?,?,?,?,?,?,?)";
        var param = [it.fk_collection , it.pageid , it.pageid, it.weightIUCN, it.weightContinent, it.type, it.taxonConceptId, it.taxonName, it.common_name , it.iNat , it.title, it.filename];
        arr.push(runQuery(query , param) ); 
      });
      $.when.apply(this, arr).then(function () {
        console.log('when finished dfd.resolve loadItemsFile');
        return  dfd.resolve();
      });
  });
  return dfd.promise();
 }
 
// ----------------------------------------------- Utilitaire de requêtes------------------------------------------ //


function runQuery(query , param) {
    return $.Deferred(function (d) {
        directory.db.transaction(function (tx) {
            tx.executeSql(query, param, 
            successWrapper(d), failureWrapper(d));
        });
    });
};

function successWrapper(d) {
    return (function (tx, data) {
        //console.log('wsuccessWrapper');
        d.resolve(data)
    })
};

function failureWrapper(d) {
    return (function (tx, error) {
       console.log('failureWrapper');
       console.log(error);
        d.reject(error)
    })
};

