"use strict";


Backbone.View.prototype.close = function () {
  if (this.beforeClose) {
    var r = this.beforeClose();
    if (r == false ){
      return false;
    }
  }
  
  this.undelegateEvents();
  this.remove();
  this.unbind();
};

// -------------------------------------------------- The Views ---------------------------------------------------- //


directory.views.HomeView = Backbone.View.extend({
  templateLoader: directory.utils.templateLoader,
  
  tagName : 'div',
  id : 'home-page',
  
  initialize : function() {
    this.template = _.template(this.templateLoader.get('home-page'));
  },

  render : function() {
    this.$el.html(this.template());
    return this;
  },

});
	
directory.views.SearchPage = Backbone.View.extend({
    tagName:'div',
    id : 'searchPage',
    templateLoader: directory.utils.templateLoader,
    taxonsListView: directory.views.TaxonsListView,

    initialize: function() {
        this.model.findByName('Animalia');
        this.template = _.template(this.templateLoader.get('search-page'));
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        this.listView = new directory.views.taxonsListView({el: $('ul', this.el), model: this.model});
        this.listView.render();
        return this;
    },

    events: {
        "keyup .search-key": "search"
    },

    search: function(event) {
        var key = $('.search-key').val();
        this.model.findByName(key);
    }
});

directory.views.TaxonsListView = Backbone.View.extend({

    initialize: function() {
        this.model.bind("reset", this.render, this);
    },

    render: function(eventName) {
        $("#taxonList").empty();
        _.each(this.model.models, function(taxon) {
            $("#taxonList").append(new directory.views.TaxonListItemView({model: taxon}).render().el);
        }, this);
        return this;
    }

});

directory.views.TaxonListItemView = Backbone.View.extend({

  tagName: "li",
  DetailTaxonsView: directory.views.TaxonPanel,

  initialize: function() {
    this.template = _.template(directory.utils.templateLoader.get('taxon-list-item'));
  },

  render: function(eventName) {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
 
  events: {
   'click div.taxon-list-item': 'loadTaxonDetail'
  },
    
  loadTaxonDetail: function(event){
    var taxonId  = arguments[0].currentTarget.id;
    var taxon = new directory.models.Taxon({id:taxonId, taxonConceptId: taxonId});
    taxon.fetch({
      success: function(data) {
        $("#panel_taxon-detail").empty();
        $("#panel_taxon-detail").append(new directory.views.TaxonPanel({model: taxon}).render().el);
      }
    });
  },
});

directory.views.TaxonPanel = Backbone.View.extend({

    initialize: function() {
        this.template = _.template(directory.utils.templateLoader.get('taxon-panel'));
    },
    
    render: function(eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
    
    events: {
        'click div.accordion-heading': 'changeIcon'
    },
      
    changeIcon: function(event){
      $('.accordion-group').on('hide', function () {
          $(this).children().children().children().removeClass('ui-icon-minus');
          $(this).children().children().children().addClass('ui-icon-plus');
      })
      $('.accordion-group').on('show', function () {
          $(this).children().children().children().removeClass('ui-icon-plus');
          $(this).children().children().children().addClass('ui-icon-minus');
      })
        
    },
    
});

directory.views.GalleryListView = Backbone.View.extend({
  tagName:'div',
  id : 'gallery-list-page',
  templateLoader: directory.utils.templateLoader,
  
  initialize: function() {
    this.model.findAll();
    this.model.bind("reset", this.render, this);
    this.template = _.template(this.templateLoader.get('gallery-page'));
  },

  render: function(eventName) {
    $(this.el).html(this.template());
    _.each(this.model.models, function(gallery) {
        $("#gallery-list", this.el).append(new directory.views.GalleryListItemView({model: gallery}).render().el);
    }, this);
    return this;
  },
  
});

directory.views.playListGalleryView = Backbone.View.extend({
  tagName:'div',
  id:'play-list-gallery-page',
  templateLoader: directory.utils.templateLoader,
  
  initialize: function() {
    this.collection.findAll();
    this.collection.bind("reset", this.render, this);
    this.template = _.template(this.templateLoader.get('play-gallery'));
  },

  render: function(eventName) {
    $(this.el).html(this.template());
    _.each(this.collection.models, function(gallery) {
      console.log(gallery.get('level'));
      $("#play-list-gallery", this.el).append(new directory.views.playListGalleryItemView({model: gallery}).render().el);
    }, this);
    return this;
  },
});

directory.views.playListGalleryItemView = Backbone.View.extend({
  tagName: "li",
  
  initialize: function() {
    this.template = _.template(directory.utils.templateLoader.get('play-list-gallery'));
  },

  render: function(eventName) {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
});

directory.views.GalleryListItemView = Backbone.View.extend({
  tagName: "li",
  
  initialize: function() {
    this.template = _.template(directory.utils.templateLoader.get('gallery-list-item'));
  },

  render: function(eventName) {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },
});

directory.views.GalleryDetailView  = Backbone.View.extend({    
  tagName:'div',
  id:'collection-detail',
  
  initialize: function(){
    this.template = _.template(directory.utils.templateLoader.get('gallery-detail'));
  }, 

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  onAddToDom: function() {
    this.graphView = new directory.views.D3GraphPanelView({model:this.model});
    $("#search-taxon-content", this.el).append(this.graphView.render().el); 
    this.graphView.onAddToDom();
  }
});


directory.views.D3GraphPanelView  = Backbone.View.extend({    
  tagName:'div',
  id:'d3-graph-panel',
  
  initialize: function(){
    this.template = _.template(directory.utils.templateLoader.get('d3-graph-panel'));
  }, 

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    $("#panel_taxon-detail", this.el).append(new directory.views.GalleryPanel({model:this.model}).render().el); 
    return this;
  },
  
  onAddToDom: function() {
     this.graph = new MeolGraph("meolGraphContainer", {
              "dataSource"              : "data/hierarchies/"+ this.model.get('collectionid') +".json",
              "canvasWidth"             : widthScreen,
              "canvasHeight"            : heightScreen,
              "charge"                  : -1200,
              "distance"                : 100,
              "nodeBoxWidth"            : 110,
              "nodeBoxRx"               : 10,
              "nodeNonLeafHeight"       : 30,
              "nodeLeafHeight"          : 90,
              "nodeLabelXOffset"        : 10,
              "nodeLabelYLeafOffset"    : 12,
              "nodeLabel2YLeafOffset"   : 24,
              "nodeLabelYNonLeafOffset" : 17,
              "nodeExpandCircleXOffset" : 92,
              "nodeExpandCircleYOffset" : 15,
              "nodeExpandCircleR"       : 10,
              "nodeImageWidth"          : 104,
              "nodeImageHeight"         : 67,
              "nodeImageXOffset"        : 3,
              "nodeImageLeafYOffset"    : 3
    });
    
  },
  events: {
   'click #collapseAll': 'collapseAll',
   'click #expandAll': 'expandAll',
   'click .collectionName': 'displayPanelCollection',
  },
  
  collapseAll: function(event) {
    if (typeof(this.graph)!='undefined') {
      this.graph._collapseAllNodes();
      $("#panel_taxon-detail").empty();
      $("#panel_taxon-detail").append(new directory.views.GalleryPanel({model:this.model}).render().el); 
    }
  },
  expandAll: function(event) {
    if (typeof(this.graph)!='undefined') {
      this.graph._expandAllNodes(); 
    }
  },
  
  displayPanelCollection : function(event){
    if (typeof(this.graph)!='undefined') {
        $("#panel_taxon-detail").empty();
        $("#panel_taxon-detail").append(new directory.views.GalleryPanel({model:this.model}).render().el);
    }
  }
    
});

directory.views.GalleryPanel = Backbone.View.extend({

    initialize: function() {
        this.template = _.template(directory.utils.templateLoader.get('gallery-panel'));
    },

    render: function(eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
   
});

directory.views.RequestPanel = Backbone.View.extend({

    initialize: function() {
        this.template = _.template(directory.utils.templateLoader.get('request-panel'));
    },

    render: function(eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
   
});

directory.views.GalleryTaxonList = Backbone.View.extend({
    el:'div',
    
    templateLoader: directory.utils.templateLoader,
    GalleryItemListView: directory.views.GalleryItemListView,

    initialize: function() {
        this.template = _.template(this.templateLoader.get('gallery-taxon-list'));
    },

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        this.listView = new directory.views.GalleryItemListView({el: $('div', this.el), model: this.model});
        this.listView.render();
        return this;
    },
});


directory.views.playGameboardView = Backbone.View.extend({
  templateLoader: directory.utils.templateLoader,
  itemsCollection : directory.models.ItemsCollection,
  currentScoreGame : directory.models.Score,
  tagName : 'div',
  id: 'play-gameboard',
                                          
  initialize : function() {
    this.itemsCollection = new directory.models.ItemsCollection();
    var collectionId = this.model.id;
    this.itemsCollection.findAllByCollectionid(collectionId);
    this.currentProfil = this.options.currentProfil;
    this.currentScoreGame = new directory.models.Score({"fk_profil":this.currentProfil.get('Tprofil_PK_Id')});
    this.template = _.template(this.templateLoader.get('play-gameboard'));
    this.model.bind("change", this.saveScore, this);
  },
  
  render : function() {
    this.$el.html(this.template( {"gallery": this.model.toJSON(), "profil":this.currentProfil.toJSON()}));
    $('#map', this.$el).load('css/map/map_EOL.svg');
    return this;
  },
  
  events:{
    'click #selectRandomContinent': 'selectRandomContinent',
    'click #selectRandomTaxon' : 'loadTaxonPlay',
    'change #scoreValue' : 'updateScore',    
    'click #returnToGame' : 'returnToGame',
  },
  
  beforeClose : function() {
   this.saveScore(); 
   
    //ajouter Modal avec return false true
    return true;
  },
  
  returnToGame : function(event){
    d3.select("#gameDetailPanel").classed("hidden",true);
    //window.graph = null;
    //$("#meolGraphDetail").empty();
    d3.select("#gamePanel").classed("hidden",false);
  },                                             
  
  selectRandomContinent: function(event){
    d3.select("#map svg").selectAll(".pion").classed("hideInfoContinent",true);
    var A_continents = d3.select("#map svg").selectAll(".continent");
    var rand = A_continents[Math.floor(Math.random() * A_continents.length)];
    var currentContinent =  rand[Math.floor(Math.random() * rand.length)];
    d3.selectAll(".continent").style("fill", "#E1FA9F");
    d3.select(currentContinent).style("fill", "#B9DE00");
    var currentContinentclass= currentContinent.id;
    d3.select("."+currentContinentclass).classed("hideInfoContinent",false);
    d3.select("#selectRandomTaxon").classed("hidden",false);
    d3.select("#selectRandomContinent").classed("hidden",true);
    
    d3.select("#requestPanel").classed("hidden",true);
    d3.select("#selectRandomTaxon").classed("hidden",false);
    
	var currentContinentStr = currentContinent.id;
    if (currentContinentStr === 'america-south') currentContinentStr = 'South America';
    if (currentContinentStr === 'america-north') currentContinentStr = 'North America';
	
    $("#txtCurrentContinent").html(currentContinentStr);
    $("#currentContinent").val(currentContinentStr);
    
    $("#myModal").modal('hide');
  },
  
  saveScore: function () {
    this.currentScoreGame.save();
  },
  
  updateScore: function(event){
    $("#scoreText").html($("#scoreValue").val());
    //Mise à jour de la table des scores
    var currentsc = this.currentScoreGame.get('nbAnswerGood');
    this.currentScoreGame.set('nbAnswerGood', currentsc+1);
  },
  
  loadTaxonPlay: function(event){
    var currentsc = this.currentScoreGame.get('nbQuestionTotal');
    this.currentScoreGame.set('nbQuestionTotal', currentsc+1);
    
    //Selection des 3 taxons de façon aléatoire
    var selectedItemsCollection = new directory.models.ItemsCollection();
    var indexId1 = Math.floor(Math.random()*this.itemsCollection.models.length);
    selectedItemsCollection.models[0] = this.itemsCollection.models[indexId1];
    
    var indexId2 = Math.floor(Math.random()*this.itemsCollection.models.length)
    while ( indexId2 ==indexId1 )  {
      indexId2 = Math.floor(Math.random()*this.itemsCollection.models.length); 
    }
    selectedItemsCollection.models[1] = this.itemsCollection.models[indexId2];
    
    var indexId3 = Math.floor(Math.random()*this.itemsCollection.models.length)
    while ( (indexId3 ==indexId1 ) || (indexId3 ==indexId2 ) )  {
      indexId3 = Math.floor(Math.random()*this.itemsCollection.models.length); 
    }
    selectedItemsCollection.models[2] = this.itemsCollection.models[indexId3];
    
    //Ajout d'un faux item
    var falseItem = new directory.models.Item();
    falseItem.set('filename',  "unknown_taxon.jpg");
    falseItem.set('Titem_PK_Id',  "-1");
    falseItem.set('preferredCommonNames',  "None of them");
    selectedItemsCollection.models[3] = falseItem;
    
    //Création de la vue des éléments du jeux
    if (typeof(this.listView) !== 'undefined') {
      this.listView.remove();
    }
    this.listView = new directory.views.RandomItemListView({ model: selectedItemsCollection});
    this.listView.gallery = this.model;
    this.listView.render();
    $('#taxonSelectList', this.el).append(this.listView.el);
    //Mise en forme du panel
    d3.select("#requestPanel").classed("hidden",false);
    d3.select("#selectRandomTaxon").classed("hidden",true);
    $(".playableTaxonHidden").hide();
    return this;
  },
});

directory.views.RandomItemListView = Backbone.View.extend({
  tagName: "div",
  gallery:  directory.models.Gallery,
  
  initialize: function() {
    this.template = _.template(directory.utils.templateLoader.get('request-panel'));
    this.model.bind("reset", this.render, this);
  },

  render: function(eventName) {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  events:{
    'click .playableTaxon img': 'expandItemSticker',
   /* 'click .playableTaxonClose img' : 'reduceItemSticker',*/
    'click .playableTaxonValidate' : 'validateItem',
    'click .playableTaxonDetail' :  'showGraph',
  },
   
  showGraph : function(event){
    d3.select("#gameDetailPanel").classed("hidden",false);
    d3.select("#gamePanel").classed("hidden",true);
    var arrayId = parseInt(event.currentTarget.id.replace("detailTaxon-", ''));
    var currentGalleryId = this.model.models[arrayId].attributes.fk_collectionid;
    
    if (typeof(this.graphView) === 'undefined' ) {
      $("#graph-panel").empty();
      //delete window.graph;
      this.graphView = new directory.views.D3GraphPanelView({model:this.gallery});
      $('#graph-panel').append(this.graphView.render().el);    
      this.graphView.onAddToDom();
    }
    else{
      this.graphView.graph.refreshCurrentNode(this.model.models[arrayId].get('taxonConceptId'));
    }

    this.graphView.graph.displayPanel(this.model.models[arrayId].get('taxonConceptId'), this.model.models[arrayId].attributes.filename);
    },
   

  
  expandItemSticker : function(event){
    var target = event.currentTarget.id;
    //réduction des autres éléments
    $(".playableTaxonHidden").hide(5);
    $(".playableTaxon").removeAttr('style');
    //$(".playableTaxon").animate({width:"20%",height:"30%"},500);
    //Mise en avant de l'élément sélectionné
    $("#"+target).parent().animate({width:"30%",height:"45%"},500);
    var cssObj={ 'z-index': '5','position': 'relative','margin': '-10% -10% 20px'}
    $("#"+target).parent().css(cssObj);
    $("#"+target).parent().children(".playableTaxonHidden").show(5);
  },
       
 /*reduceItemSticker: function(event){
    $(".playableTaxonHidden").hide(5);
    $(this).parent().parent(".playableTaxon").removeAttr('style');
    $(this).parent().parent(".playableTaxon").animate({width:"20%",height:"30%" },500);
  },*/
  
  validateItem: function(event){
    $("#scoreMessageModal").empty();
    $("#reponseMessageModal").empty();
    $("#myModal h5").remove();
    var target = event.currentTarget.id;
    var arrayId = parseInt(target.replace("validate-", ''));
    var currentObjectId = this.model.models[arrayId].attributes.Titem_PK_Id;
    //Change la classe css de l'item selectionné
    $("#item-"+currentObjectId).removeClass("gradientGrey");
    $("#item-"+currentObjectId).addClass("gameCurrentSelectedItem");
    
    var currentContinentStr = $("#currentContinent").val();
    
    
    //Selection des items corrects pour ce continent
    var correctItems = new Array();
    var existTrueResponse = false;
    $("#reponseMessageModal").before('<h5>Right answer</h5>');
    for (var id in this.model.models) {
      correctItems[id] = false;
      var presence = this.model.models[id].attributes.iNat.split(",");
      for (var idNat in presence) {
        if (currentContinentStr.toLowerCase() == presence[idNat].toLowerCase()) {
          correctItems[id] = true;
          existTrueResponse = true;
          //Affiche la ou les bonnes réponses
          $("#item-"+this.model.models[id].attributes.Titem_PK_Id).removeClass("gradientGrey");
          $("#item-"+this.model.models[id].attributes.Titem_PK_Id).addClass("gameTrueSelectedItem");
          /*$("#item-"+this.model.models[id].attributes.Titem_PK_Id).animate({width:"30%",height:"45%"},500);
          var cssObj={ 'z-index': '5','position': 'relative','margin': '-20% -10% 20px'}
          $("#item-"+this.model.models[id].attributes.Titem_PK_Id).css(cssObj);
          $("#item-"+this.model.models[id].attributes.Titem_PK_Id).children(".playableTaxonHidden").show(5);*/

          $("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
        }
      }
    }
    
    var found = false;
    if ((correctItems[arrayId] == true )  || ((currentObjectId == -1 ) && (existTrueResponse == false))  )  {
      $("#item-"+currentObjectId).removeClass("gradientGrey");
      $("#item-"+currentObjectId).addClass("gameTrueSelectedItem");
      found = true;
    }
    
    if (found == false) {
      /*$("#item-"+currentObjectId).removeClass("gradientGrey");
      $("#item-"+currentObjectId).addClass("gameFalseSelectedItem");*/
      if (! existTrueResponse) {
        $("#item--1").removeClass("gradientGrey");
        $("#item--1").addClass("gameTrueSelectedItem");
        /*$("#item--1").animate({width:"30%",height:"45%"},500);
        var cssObj={ 'z-index': '5','position': 'relative','margin': '-20% -10% 20px'}
        $("#item--1").css(cssObj);
        $("#item--1").children(".playableTaxonHidden").show(5);*/
        $("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
      }
      var currentScore = parseInt($("#scoreValue").val());
      $("#scoreValue").val(currentScore-+0).trigger('change');
      //Message succes Modal
      $("#txtMessageModal").html("Too bad!");
      
    }
    else {
        var currentScore = parseInt($("#scoreValue").val());
        $("#scoreValue").val(currentScore+100).trigger('change');
	//Message succes Modal
	$("#txtMessageModal").html("Well Done!");
	$("#scoreMessageModal").html("+100 points");
    }
    
    d3.select("#selectRandomContinent").classed("hidden",false);
    //réduction des autres éléments
    /*$(".playableTaxonHidden").hide("slow");
    $(".playableTaxon").removeAttr('style');
    $(".playableTaxon").animate({width:"20%",height:"30%" },500);*/
    $("#myModal").modal('show');
    $(".playableTaxon").not(".gameTrueSelectedItem").children(".playableTaxonHidden").hide(5);
    $(".playableTaxon").not(".gameTrueSelectedItem").removeAttr('style');
    //$(".playableTaxon").not(".gameTrueSelectedItem").animate({width:"20%",height:"30%" },500);
    //$(".gameCurrentSelectedItem").children(".playableTaxonHidden").hide(5);
    
    //désactive les événements pour que le joueur ne puisse pas rejouer
    $(".playableTaxonValidate").remove();
   //$("#item-"+currentObjectId).removeClass("gameCurrentSelectedItem");
  },
});

directory.views.ProfilDetailView = Backbone.View.extend({
  tagName: "div",
  
  initialize: function() {
    this.collection = new directory.models.ScoresCollection();
    this.template = _.template(directory.utils.templateLoader.get('profil-page'));
    this.collection.findAllScoreByProfilId(this.model.get('Tprofil_PK_Id'));
    this.model.bind("reset", this.render, this);
    this.collection.bind("reset", this.render, this);
    this.collection.bind("change", this.render, this);
  },

  render: function(eventName) {
    //backbone.js View template {collection: this.collection, model:this.model}
    this.$el.html(this.template({"collection":this.collection.toJSON(), "model":this.model.toJSON()}));
    return this;
  },
});
