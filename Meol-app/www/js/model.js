"use strict";

// -------------------------------------------------- The Models ---------------------------------------------------- //
// The Taxon Model
directory.models.Taxon = Backbone.Model.extend({
  defaults: {
    "fk_collectionid":"",
    "pageid":null,
    "taxonConceptId":null,
    "taxonName":"",
    "flathierarchy":"",
    "preferredCommonNames":"",
    "textDesc_objectid ":null,
    "textDesc_title ":"",
    "textDesc_credits ":"",
    "textDesc_description":"",
    "iucnStatus":"",
    "image_objectid ":null,
    "image_title":"",
    "image_credits":"",
    "image_fileName":"",
  },

  dao: directory.dao.TaxonDAO,

  parse: function (response) {
    var hier = eval(response.flathierarchy);
    response.flat = hier;
    response.iucnPicture = this.switchIucnStatusDesc(response.iucnStatus);
    return response;
  },
  
  initialize: function() {
   
  },
  
  switchIucnStatusDesc : function (IucnStatusDesc) {
    if (typeof(IucnStatusDesc)!='undefined'){
      switch (IucnStatusDesc){
        case "Least Concern (LC)": return "Status_iucn3.1_LC.svg.png";
          break;
        case "Near Threatened (NT)": return "Status_iucn3.1_NT.svg.png";
          break;
        case "Vulnerable (VU)": return "Status_iucn3.1_VU.svg.png";
          break;
        case "Endangered (EN)": return "Status_iucn3.1_EN.svg.png";
          break;
        case "Critically Endangered (CR)": return "Status_iucn3.1_CR.svg.png";
          break;
        case "Extinct in the Wild (EW)": return "Status_iucn3.1_EW.svg.png";
          break;
        case "Extinct (EX)": return "Status_iucn3.1_EX.svg.png";
          break;
      }
    }
  }
});

// The TaxonCollection Model
directory.models.TaxonCollection = Backbone.Collection.extend({

  dao: directory.dao.TaxonDAO,

  model: directory.models.Taxon,

  initialize: function() {      
  },

  findByName: function(key) {
    var self = this;
     new this.dao(directory.db).findByName(key, function(data) {
          self.reset(data);
      });
  },

  findAllByCollectionid: function(key) {
    var self = this;
     new this.dao(directory.db).findAllByCollectionid(key, function(data) {
          self.reset(data);
      });
  }

});


directory.models.Gallery = Backbone.Model.extend({
  defaults: {
    "Tgallery_PK_Id":null,
    "collectionid":null,
    "name":"",
    "description":"",
    "logo":"",
    "level":0,
    "ordre":0,
    "active": false
  },
  
  dao:directory.dao.GalleryDAO,
  
});
/*
_.extend(
  directory.models.Gallery.prototype , {
    dao: function() {
        return new directory.dao.GalleryDAO();
    }, 
  }
);
*/

directory.models.GalleriesCollection = Backbone.Collection.extend({
  model: directory.models.Gallery,
  
  modelType:"GalleriesCollection",
  
  dao:directory.dao.GalleryDAO,
  
  initialize: function() {
    
  },

  findAll: function(key) {
    var self = this;
    new this.dao(directory.db).findAll(function(data) {
      self.reset(data);
    });
  },
  
  galleryIsActive: function(ordre) {
    var selectedGallery = this.findWhere( {'ordre': ordre});
    if(typeof(selectedGallery) !== 'undefined'){
      return selectedGallery.get('active');
    }
   
  },
  
  changeGalleryActivateState: function(ordre) {
    if (this.galleryIsActive(ordre) !== 'true' && this.galleryIsActive(ordre) !== 'undefined') {
      var newStatus = 'true';
      var collectionid = this.findWhere( {'ordre': ordre}).get('collectionid');
      this.findWhere( {'ordre': ordre}).set('id', collectionid)
        .set('active', newStatus)
        .save();  
    }
  },
});

// The Items Model
directory.models.Item = Backbone.Model.extend({
  defaults: {
    "fk_collectionid":null,
    "object_id":null,
    "pageid":null,
    "weightIucn":0,
    "weightContinent":0,
    "type":"",
    "taxonConceptId":null,
    "taxonName":"",
    "preferredCommonNames":"",
    "iNat":"",
    "title":"",
    "filename":""
  },

  dao: directory.dao.ItemDAO,

  parse: function (response) {
    response.iNat = response.iNat.split(",");
    return response;
  },
  
  initialize: function() {
  },
  
});

// The TaxonCollection Model
directory.models.ItemsCollection = Backbone.Collection.extend({

  dao: directory.dao.ItemDAO,

  model: directory.models.Item,

  initialize: function() {
  },
    
  findAllByCollectionid: function(key) {
    var self = this;
     key = parseInt(key);
     new this.dao(directory.db).findByGalleryId(key, function(data) {
          self.reset(data);
      });
  }

});


// The Profil Model
directory.models.Profil = Backbone.Model.extend({
  defaults: {
    "Tprofil_PK_Id":null,
    "pseudo":"", 
    "avatar":"",
    "email":"",
    "creationDate":new Date()
  },

  dao: directory.dao.ProfilDAO,
  
  initialize: function() {
  },
  
});


// The ProfilsCollection Model
directory.models.ProfilsCollection = Backbone.Collection.extend({

  dao: directory.dao.ProfilDAO,

  model: directory.models.Profil,

  initialize: function() {
  },
  
  findById: function(key) {
    var self = this;
     new this.dao(directory.db).findById(key, function(data) {
          self.reset(data);
      });
  },
  
  findByPseudo: function(key) {
    var self = this;
     new this.dao(directory.db).findAllByCollectionid(key, function(data) {
          self.reset(data);
      });
  },
    
});


// The Score Model
directory.models.Score = Backbone.Model.extend({
  defaults: {
    "fk_profil":null,
    "fk_gallery":0,
    "gameDate" :new Date(),
    "nbQuestionTotal":0,
    "nbAnswerGood":0,
    "nbAnswerGoodSequence":0,
    "score":0,
    "nbQuestionTotalAfrica":null, 
    "nbQuestionTotalAsia":null, 
    "nbQuestionTotalAntartica":null, 
    "nbQuestionTotalEurope":null, 
    "nbQuestionTotalOceania":null, 
    "nbQuestionTotalAmericaNorth":null, 
    "nbQuestionTotalAmericaSouth":null,
    "nbAnswerGoodAfrica":null, 
    "nbAnswerGoodAsia":null, 
    "nbAnswerGoodAntartica":null, 
    "nbAnswerGoodEurope":null, 
    "nbAnswerGoodOceania":null, 
    "nbAnswerGoodAmericaNorth":null, 
    "nbAnswerGoodAmericaSouth":null
  },

  dao: directory.dao.ScoreDAO,
  
  initialize: function() {
  },
});

// The ScoresCollection Model
directory.models.ScoresCollection = Backbone.Collection.extend({
  model: directory.models.Score,
  
  dao: directory.dao.ScoreDAO,
  
  initialize: function() {
  },
  
  /*findAllScoreByProfilId : function (id) {
     var self = this;
     new this.dao(directory.db).findAllScoreByProfilId(id, function(data) {
          self.reset(data);
      });
  },*/
  
   findAllScoreByProfilId : function (id) {
     var c = $.Deferred();
     
     (new this.dao(directory.db)).findAllScoreByProfilId(id,function(data) {
          c.resolve(data);
      });
     
     return c;
  },
  
 
  findScoreMaxByGallery: function() {
     var d = $.Deferred();
     (new this.dao(directory.db)).findScoreMaxByGallery(function(data) {
          d.resolve(data);
      });
     return d;
  },
  
});
