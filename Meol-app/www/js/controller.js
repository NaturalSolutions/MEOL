"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

directory.Router = Backbone.Router.extend({
  //currentProfil : directory.models.ProfilsCollection,
  
  routes: {
      "": "home",
      //"": "searchtaxon",
      "infoGame": "infoGame",
      "searchtaxon": "searchtaxon",
      "gallery": "discoverGalleryList",
      "gallery/:galleryId": "discoverGalleryTaxonomicTreeView",
      "play" : "playListGallery",
      "play/:galleryId" : "playGameboardDisplay",
      "profil/:profilId" : "profilDisplay",
      "feedback" : "feedbackDisplay",
      //"taxon/:taxonConceptId": "taxonDetails",
  },

  initialize: function() {

      var self = this;

      // Keep track of the history of pages (we only store the page URL). Used to identify the direction
      // (left or right) of the sliding transition between pages.
      this.pageHistory = [];

      // Register event listener for back button troughout the app
      $('#content').on('click', '.header-back-button', function(event) {
          window.history.back();
          return false;
      });

      // Check of browser supports touch events...
      if (document.documentElement.hasOwnProperty('ontouchstart')) {
          // ... if yes: register touch event listener to change the "selected" state of the item
          $('#content').on('touchstart', 'a', function(event) {
              self.selectItem(event);
          });
          $('#content').on('touchend', 'a', function(event) {
              self.deselectItem(event);
          });
      } else {
          // ... if not: register mouse events instead
          $('#content').on('mousedown', 'a', function(event) {
              self.selectItem(event);
          });
          $('#content').on('mouseup', 'a', function(event) {
              self.deselectItem(event);
          });
      }
      
     this.currentProfil = new directory.models.Profil({Tprofil_PK_Id:1});
     this.currentProfil.fetch();
  },

  selectItem: function(event) {
      $(event.target).addClass('tappable-active');
  },

  deselectItem: function(event) {
      $(event.target).removeClass('tappable-active');
  },

  home: function(){
    if (typeof (this.homePage) === 'undefined') this.homePage = new directory.views.HomeView();
    this.displayView(this.homePage);
  },
  
  feedbackDisplay : function(){
    this.feedback = new directory.views.feedbackView();
    this.displayView(this.feedback);
  },
  searchtaxon: function() {
    var self = this;
    this.searchResults = new directory.models.TaxonCollection();
    var currentView = new directory.views.SearchPage({model: this.searchResults});
    this.displayView(currentView);
  },
  infoGame :function() {
    this.infoGame = new directory.views.InfoGameView();
    this.displayView(this.infoGame);
  },
  displayView : function (view) {
    var self = this;
    var dfda = Array();
    if (this.currentView) {
      dfda.push(this.currentView.close());
    }
    else {
      var dfdl = $.Deferred();
      dfda.push(dfdl);
      dfdl.resolve(true);
    }
    $.when.apply(null, dfda)
      .done(function() {
        view.render();
        self.currentView = view;
        self.pageHistory = [window.location.hash];
        $('#content').empty();
        $('#content').append(view.el);
        if(view.onAddToDom) view.onAddToDom();
      })
      .fail(function() {
        self.navigate(self.pageHistory[0]);  
      });
    },
                                       
  discoverGalleryList: function() {
      var currentView = new directory.views.GalleryListView({model: directory.data.galleriesList});
      this.displayView(currentView);
  },
  
  playListGallery: function() {
    var currentView = new directory.views.playListGalleryView({collection: directory.data.galleriesList, currentProfil : self.currentProfil});
    this.displayView(currentView);
  },

  playGameboardDisplay : function(id) {
    var self = this;   
    var gallery = directory.data.galleriesList.findWhere( {'collectionid': id});
    
    gallery.set('id', id);
    
    if(gallery.get('active') == "false"){
       alert(gallery.get('active'));
       window.history.back();
       return false;
    }else{
      var selfProfil =self.currentProfil;
      var scoreByfk_profil = new directory.models.ScoresCollection();
      scoreByfk_profil.fetch({
        success: function(data) {
        var lastScoreByGallery = data.findWhere({'fk_gallery': parseInt(id)});
        var deferred = data.findScoreMaxByGallery();
        deferred.done(function(items) {
          var score = 0;
          _.each(items, function(item) {
            score += item.score_max;
            if(item.fk_gallery == id){
             var lastScoreByGallery = item.score_max;
            }
          });
          var currentView = new directory.views.playGameboardView({model: gallery, currentProfil : self.currentProfil, lastScoreByGallery: lastScoreByGallery, scoreByfk_profil:data, ScoreGlobal: score});
          self.displayView(currentView);
          });  
        }
      });
    }
  
  },
  //graph discoverView    
  discoverGalleryTaxonomicTreeView: function(id) {
    var gallery = directory.data.galleriesList.findWhere( {'collectionid': id});
    
    gallery.set('id', id);
    
    var currentView = new directory.views.GalleryDetailView({model: gallery});
    this.displayView(currentView);          
  },

  profilDisplay: function(id) {
      var self = this;
      var profil = new directory.models.Profil({Tprofil_PK_Id:id});
        
      profil.fetch({
          success: function(data) {
						var currentView = new directory.views.ProfilDetailView({model: data});
						self.displayView(currentView);		
					}
      });
  },

});
