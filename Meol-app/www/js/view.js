"use strict";

Backbone.View.prototype.close = function () {
  var dfd = $.Deferred();
  var self = this;
  
  var dfda = Array();
  if (this.beforeClose) {
	dfda.push(this.beforeClose());
  }
  else {
	var dfdl = $.Deferred();
    dfda.push(dfdl);
    dfdl.resolve(true);
  }
  $.when.apply(null, dfda)
  .done(function() {
	self.undelegateEvents();
	self.remove();
	self.unbind();
	dfd.resolve();
  })
  .fail(function() {
	dfd.reject();
  });
  return dfd.promise();
  
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
	
directory.views.InfoGameView = Backbone.View.extend({
  templateLoader: directory.utils.templateLoader,
  
  tagName : 'div',
  id : 'info-page',
  
  initialize : function() {
    this.template = _.template(this.templateLoader.get('info-page'));
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
        this.listView = new directory.views.TaxonsListView({el: $('ul', this.el), model: this.model});
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
    //this.collection.findAll();
    this.collection.bind("reset", this.render, this);
	this.currentProfil = this.options.currentProfil;
    this.template = _.template(this.templateLoader.get('play-gallery'));
  },

  render: function(eventName) {
    $(this.el).html(this.template({collection: this.collection}));
	//test filter()
	//var activeGall = this.collection.models.filter(function(gall) {return gall.get("level") === 1});
    /*_.each(this.collection.models, function(gallery) {
	   $("#play-list-gallery", this.el).append(new directory.views.playListGalleryItemView({model: gallery,currentProfil : this.currentProfil}).render().el);
    }, this);*/
    return this;
  },
});



/*subview playListGalleryView à enlever avec sa template
 directory.views.playListGalleryItemView = Backbone.View.extend({
  tagName: "li",
  
  initialize: function() {
	//EN COURS remonter le currentScoreGame ....à mettre dans la view PlayListGallery
	this.galleryActive = 1;
    this.template = _.template(directory.utils.templateLoader.get('play-list-gallery'));
  },

  render: function(eventName) {
	if(this.galleryActive < this.model.get("level")){
	  $(this.el).addClass("ui-disabled").html(this.template(this.model.toJSON()));
	}else{
	  $(this.el).html(this.template(this.model.toJSON()));
	}
    return this;
  },
});*/

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

/*directory.views.RequestPanel = Backbone.View.extend({

    initialize: function() {
        this.template = _.template(directory.utils.templateLoader.get('request-panel'));
    },

    render: function(eventName) {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },
   
});*/

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
    'change #currentContinent' : 'loadTaxonPlay',
    'change #scoreTotalValue' : 'updateScore',
	'change #nbAnwserGoodValue' : 'updateNbAnwserGood',
	'change #nbAnwserGoodSequenceValue' : 'updateNbAnwserGoodSequenceValue',
    'click #returnToGame' : 'returnToGame',
  },
  
  
 
 /* beforeClose : function getConfirm(){
	var dfd = $.Deferred();
	var self = this;
    $('#confirmbox').modal({show:true,
                            backdrop:false,
                            keyboard: false,
    });
    $('#confirmMessage').html("Do you want to leave the game?");
    $('#confirmTrue').click(function(){
		self.saveScore();
        dfd.resolve(true);
		$('#confirmbox').modal('hide');
    });
    $('#confirmFalse').click(function(){
        dfd.reject(false);
		$('#confirmbox').modal('hide');
    });
	return dfd.promise();
  },*/
  beforeClose : function(){
   this.saveScore();
  },
  
  returnToGame : function(event){
    d3.select("#gameDetailPanel").classed("hidden",true);
    //window.graph = null;
    //$("#meolGraphDetail").empty();
    d3.select("#gamePanel").classed("hidden",false);
  },                                             
  
  selectRandomContinent: function(event){
	/*var activeContinent = this.model.attributes.activeContinent;
	var desactiveContinent = this.model.attributes.desactiveContinent;
	for( var desactive in desactiveContinent ){
	  d3.select("#"+desactiveContinent[desactive]).remove();
	};*/
    d3.select("#map svg").selectAll(".pion").classed("hideInfoContinent",true);
	//d3.select("#map svg").selectAll(".pion").style("display","none");
	d3.select("#selectRandomContinent").classed("hidden",true);
	$("#firstMessagePlay").css("display","none");
	$("#continentName").css("display","inherit");
  
	var A_continents = d3.select("#map svg").selectAll(".continent");
    var rand = A_continents[Math.floor(Math.random() * A_continents.length)];
	var shuffleRand = shuffle(rand);
	
	var countAnime = 0;
	while( countAnime < 1){
	 animateContinent();
	countAnime++;
	};
	
	function animateContinent(){
	var count=0;
	var countReset=200;
	  for( var item in shuffleRand ){	
		d3.select(shuffleRand[item]).transition().delay(count).style("fill", "#B9DE00");
		//d3.select("."+currentContinentclass).transition().delay(count).style("display","inherit");
		//setTimeout(function(){d3.select(shuffleRand[item].id).classed("hideInfoContinent",true);},count);
		//d3.select(shuffleRand[item].id).transition().delay(count).classed("hideInfoContinent",true);
		d3.select(shuffleRand[item]).transition().delay(countReset).style("fill", "#E1FA9F");
		//d3.select("."+currentContinentclass).transition().delay(countReset).style("display","none");
		count+= 150;
		countReset+=200;
	  };
	};
	var currentContinent = shuffleRand[4];
	d3.selectAll(".continent").transition().delay(1600).style("fill", "#E1FA9F");
	d3.select(currentContinent).transition().delay(1600).style("fill", "#B9DE00");

    var currentContinentclass= currentContinent.id;
	//d3.selectAll(".pion").transition().delay(1600).style("display","none");
	//d3.select("."+currentContinentclass).transition().delay(1700).style("display","inherit");
	setTimeout(function(){d3.select("."+currentContinentclass).classed("hideInfoContinent",false);},1800);
    
	$('#requestPanel').hide();
    
	var currentContinentStr = currentContinent.id;
    if (currentContinentStr === 'america-south') currentContinentStr = 'South America';
    if (currentContinentStr === 'america-north') currentContinentStr = 'North America';
	
    $(".txtCurrentContinent").html(currentContinentStr);
    $("#currentContinent").val(currentContinentStr).trigger('change');
    
    $("#myModal").modal('hide');
  },
  
  saveScore: function () {
    this.currentScoreGame.save();
  },
  
  updateScore: function(event){
	var currentsc = parseInt($("#scoreTotalValue").val());
	
	var scoreProgressBar = currentsc/20;
	window.count;
	
	var scoreProgressTotal= $("#meterScore").css("width");
	//progress Bar
	if(typeof(window.count) != 'undefined'){
	  if(parseInt(scoreProgressBar) >= window.count){
	  $(".progress").fadeIn(3000).css("box-shadow","0px 0px 10px 4px #E2E9EF");
	  $("#meterScore").css("width",scoreProgressBar+"%");
	  alert("New Collection");
	  $("#activateCollMessageModal").html("New collection!");
	  $("#meterScore").css("width","0%");
	  $(".progress").css("box-shadow","0px 0px 0px 0px #E2E9EF");
	  window.count += 100;
	  }else{
		$("#meterScore").css("width",scoreProgressBar+"%");
	  };
	}else{
		window.count = 100;
		$("#meterScore").css("width",scoreProgressBar+"%");
	  };
	
	console.log(scoreProgressBar);
	
	
	
	//Mise à jour de la table des scores
    this.currentScoreGame.set('score', currentsc);
  },
  
  updateNbAnwserGood: function(event){
	$("#nbAnwserGoodText").html($("#nbAnwserGoodValue").val());
	 //Mise à jour de la table des scores
	var currentsc = parseInt($("#nbAnwserGoodValue").val());
    this.currentScoreGame.set('nbAnswerGood', currentsc);
  },
  
  updateNbAnwserGoodSequenceValue: function(event){
	$("#bonusValue").val("0");
	$("#nbAnwserGoodSequenceText").html($("#nbAnwserGoodSequenceValue").val());
	var currentnbAnswerGoodSequence = $("#nbAnwserGoodSequenceValue").val();
	var currentnbAnswerGoodRecordSequence = $("#nbAnwserGoodSequenceRecordText").text();
	var bonusFibo = fiboSuite() ;
	
	if(currentnbAnswerGoodSequence > currentnbAnswerGoodRecordSequence){
	  $("#nbAnwserGoodSequenceRecordText").html($("#nbAnwserGoodSequenceValue").val());
	  var currentNbAnwserGoodSequenceValue = parseInt($("#nbAnwserGoodSequenceValue").val());
	  var currentFibo = bonusFibo(currentNbAnwserGoodSequenceValue);
	  if (currentFibo < 2) {
		currentFibo = 0;
	  }else{
		currentFibo *=100;
	  }
	  $("#bonusValue").val(currentFibo).trigger('change');
	  $("#bonus").html($("#bonusValue").val());
	  //Mise à jour de la table des scores
	  var currentsc = this.currentScoreGame.get('nbAnswerGoodSequence');
	  this.currentScoreGame.set('nbAnswerGoodSequence', currentsc+1);
	}
	var scoreTaxon = parseInt($("#scoreValue").val());
	var scoreBonus = parseInt($("#bonusValue").val());
    $("#scoreText").html(scoreTaxon);
	var score = scoreTaxon + scoreBonus;
	$("#scoreTotalValue").val(score).trigger('change');
	/*var scoreProgressBar = score/5;
	$("#meterScore").css("width",scoreProgressBar+"%");
	var scoreProgressTotal= $("#meterScore").css("width");*/
	//progress Bar
	/*if(parseInt(scoreProgressTotal) >= 100){
	  $(".progress").fadeIn(3000).css("box-shadow","0px 0px 10px 4px #E2E9EF");
	  alert("New Collection");
	  $("#activateCollMessageModal").html("New collection!");
	  $("#meterScore").css("width","0%");
	  $(".progress").css("box-shadow","0px 0px 0px 0px #E2E9EF");
	}else{
	  $("#meterScore").css("width",scoreProgressBar+"%");
	};*/
	
	//Modal Bonus
	if(scoreBonus > 0){
	$("#bonusMessageModal").html("+"+scoreBonus+" BONUS  points");
	}
  },
  
  
  loadTaxonPlay: function(event){        
    var currentscnbQuestionTotal = this.currentScoreGame.get('nbQuestionTotal');
    this.currentScoreGame.set('nbQuestionTotal', currentscnbQuestionTotal+1);
	
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
    falseItem.set('preferredCommonNames',  "None of These Live Here");
    selectedItemsCollection.models[3] = falseItem;
    
    //Création de la vue des éléments du jeux
    if (typeof(this.listView) !== 'undefined') {
      this.listView.remove();
    }
	var currentContinentStr = $("#currentContinent").val();
    this.listView = new directory.views.RandomItemListView({ model: selectedItemsCollection});
    this.listView.gallery = this.model;
    this.listView.render();
    $('#taxonSelectList', this.el).append(this.listView.el);
    //Mise en forme du panel
	$('#requestPanel').delay(2200).slideDown('slow');
    $(".playableTaxonHidden").hide();
	$(".txtCurrentContinent").html(currentContinentStr);
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
	$("#bonusMessageModal").empty();
    $("#reponseMessageModal").empty();
	$("#activateCollMessageModal").empty();
    $("#myModal h5").remove();
    var target = event.currentTarget.id;
    var arrayId = parseInt(target.replace("validate-", ''));
    var currentObjectId = this.model.models[arrayId].attributes.Titem_PK_Id;
    //Change la classe css de l'item selectionné
    $("#item-"+currentObjectId).removeClass("gradientGrey");
    $("#item-"+currentObjectId).addClass("gameCurrentSelectedItem");
    
    var currentContinentStr = $("#currentContinent").val();
    var weightTaxonIucn = 0;
	var weightTaxonContinent = 0;
    
    //Selection des items corrects pour ce continent
    var correctItems = new Array();
    var existTrueResponse = false;
    $("#reponseMessageModal").before('<h5>The correct answer was...</h5>');
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
          $("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
		  var idTaxon = this.model.models[id];
		  //var weightTaxonIucn = idTaxon.get('weightIucn');
		  var weightTaxonIucn = idTaxon.attributes.weightIucn;
		  var weightTaxonContinent = idTaxon.attributes.weightContinent;
        }
      }
    }
	//Nb total de bonnes réponses possibles à la question
	var newArray = [];
	for (var i=0;i<correctItems.length;i++){
	  if(correctItems[i] == true){
	  newArray.push(i);	  
	  }
	}
	if(typeof(newArray) !== 'undefined'){
	  var arrayLength = newArray.length;
	  //pondération Nb total de bonnes réponses possibles à la question
	  if (arrayLength > 1){
		var weightNbPossibilyties = arrayLength*50;
	  }else{
		 var weightNbPossibilyties = 0;
	  }
	 
	};
	
    var found = false;
    if ((correctItems[arrayId] == true )  || ((currentObjectId == -1 ) && (existTrueResponse == false))  )  {
      $("#item-"+currentObjectId).removeClass("gradientGrey");
      $("#item-"+currentObjectId).addClass("gameTrueSelectedItem");
      found = true;
    }
    if((currentObjectId == -1 ) && (existTrueResponse == false)){
	  $("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
	}
    if (found == false) {
      if (! existTrueResponse) {
        $("#item--1").removeClass("gradientGrey");
        $("#item--1").addClass("gameTrueSelectedItem");
		$("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
      }
	 
      var currentScore = parseInt($("#scoreValue").val());
      $("#scoreValue").val(currentScore+0).trigger('change');
	  //nb NbAnwserGood
	  var currentNbAnwserGood = parseInt($("#nbAnwserGoodValue").val());
      $("#nbAnwserGoodValue").val(currentNbAnwserGood+0).trigger('change');
	  //nb nbAnwserGoodSequence
      $("#nbAnwserGoodSequenceValue").val(0).trigger('change');
      //Message Modal
      $("#txtMessageModal").html("Sorry!");
      
    }
    else {
		if(weightTaxonContinent > 1){
		  var ponderationContinent = weightTaxonContinent*10;
		}else{
		  var ponderationContinent = 0;
		};
        var currentScore = parseInt($("#scoreValue").val());
		//var currentPonderation = weightTaxon + weightNbPossibilyties;
		var currentPonderation = weightNbPossibilyties + ponderationContinent;
        $("#scoreValue").val(currentScore+1000-currentPonderation).trigger('change');
		//nb nbAnwserGood
		var currentNbAnwserGood = parseInt($("#nbAnwserGoodValue").val());
        $("#nbAnwserGoodValue").val(currentNbAnwserGood+1).trigger('change');
		//nb nbAnwserGoodSequence
		var currentNbAnwserGood = parseInt($("#nbAnwserGoodSequenceValue").val());
        $("#nbAnwserGoodSequenceValue").val(currentNbAnwserGood+1).trigger('change');
		
		//Message succes Modal
		$("#txtMessageModal").html("Well Done!");
		$("#scoreMessageModal").html(1000-currentPonderation+" points");
    };
    
    d3.select("#selectRandomContinent").classed("hidden",false);
    $("#myModal").modal('show');
    $(".playableTaxon").not(".gameTrueSelectedItem").children(".playableTaxonHidden").hide(5);
    $(".playableTaxon").not(".gameTrueSelectedItem").removeAttr('style');
    
    //désactive les événements pour que le joueur ne puisse pas rejouer
    $(".playableTaxonValidate").remove();
  },
});

directory.views.ProfilDetailView = Backbone.View.extend({
  tagName: "div",
  id: 'plage-profile',
  
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
