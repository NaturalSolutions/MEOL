"use strict";

// ----------------------------------------------- The Application Router ------------------------------------------ //

directory.Router = Backbone.Router.extend({
  //currentProfil : directory.models.ProfilsCollection,
  
  routes: {
      "": "home",
      //"": "searchtaxon",
      "searchtaxon": "searchtaxon",
      "gallery": "galleryDisplay",
      "gallery/:galleryId": "galleryDetailDisplay",
      //"play" : "playPageDisplay",
      "play" : "playListGallery",
      "play/:galleryId" : "playGameboardDisplay",
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
    this.homePage.render();
    this.displayView(this.homePage);
  },

  searchtaxon: function() {
      var self = this;
      this.searchResults = new directory.models.TaxonCollection();
      this.currentView = new directory.views.SearchPage({model: this.searchResults});
      this.currentView.render();
      this.displayView(this.currentView);
  },
  
  displayView : function (view) {
    //if (this.currentView) this.currentView.close();
    this.pageHistory = [window.location.hash];
    $('#content').empty();
    $('#content').append(view.el);
    if(view.onAddToDom) view.onAddToDom();
  },
                                       
  galleryDisplay: function() {
      var galleryListResults = new directory.models.GalleriesCollection();
      this.currentView = new directory.views.GalleryListView({model: galleryListResults});
      this.currentView.render();
      this.displayView(this.currentView);
  },
  
  //TODO voir si models peut etre celui de GalleriesCollection
  playListGallery: function() {
      var playListGalleryResults = new directory.models.GalleriesCollection();
      this.currentView = new directory.views.playListGalleryView({model: playListGalleryResults});
      this.currentView.render();
      this.displayView(this.currentView);
  },

  playGameboardDisplay : function(id) {
    var self = this;
    /*if (typeof this.gameView !== 'undefined') {
      this.gameView.remove();
    } */
    var gallery = new directory.models.Gallery({id:id, collectionid: id});
    //if (typeof(this.gameView) !== 'undefined') this.gameView.destroy_view();
    gallery.fetch({
      success: function(data) {
            self.currentView = new directory.views.playGameboardView({model: data});
            self.currentView.currentProfil= self.currentProfil;
            self.currentView.render();
            self.displayView(self.currentView);
            //$(self.gameView.el).attr('id', 'play-gameboard');
            //self.slidePage(self.gameView);
      }
    })
  },
      
  galleryDetailDisplay: function(id) {
      var self = this;
      var gallery = new directory.models.Gallery({id:id, collectionid: id});
      gallery.fetch({
          success: function(data) {
            self.currentView = new directory.views.GalleryDetailView({model: data});
            //this.galleryListView = new directory.views.GalleryListView();
            self.currentView.render();
            self.displayView(self.currentView);
            
          }
      });
  },


});
