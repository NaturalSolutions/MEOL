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
 /*
* Base view: customize Backbone.Layout for remote template loading
*/

directory.views.BaseView = Backbone.Layout.extend({
  prefix: directory.config.root + '/tpl/',
 // el: false, // LM will use template's root node

  fetch: function(path) {
      path += '.html';
      directory.templates = directory.templates || {};

      if (directory.templates[path]) {
          return directory.templates[path];
      }

      var done = this.async();

      $.get(path, function(contents) {
          done(directory.templates[path] = _.template(contents));
      }, "text");
  },

  serialize: function() {
      if (this.model) return this.model.toJSON();
      return true;
  }
});


directory.views.HomeView = directory.views.BaseView.extend({
  template:'home-page',
 
  initialize : function() {
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
        $("#panel_taxon-detail").append(new directory.views.TaxonPanel({model: data}).render().el);
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
        'click div.accordion-heading': 'changeIcon',
				'click .moreInfo':'tooltipIucn'
    },
      
    changeIcon: function(event){
      $('.accordion-group').on('hide', function () {
				$(this).children().children().children("i").removeClass('icon-minus');
				$(this).children().children().children("i").addClass('icon-plus');
      })
      $('.accordion-group').on('show', function () {
				$(this).children().children().children("i").removeClass('icon-plus');
				$(this).children().children().children("i").addClass('icon-minus');
      })
        
    },
		tooltipIucn: function(event){
			if (document.documentElement.hasOwnProperty('ontouchstart')){
				var $title = $(".moreInfo").find(".title");
				if (!$title.length) {
					$(".moreInfo").append('<span class="title">' + $(".moreInfo").attr("title") + '</span>');
				} else {
					$title.remove();
				}
			}
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
	events:{
		'click #descCollBtn':'showdescCollModal',
  },
	showdescCollModal: function(event){
		$("#descCollModal").modal('toggle');
	},
  
});

directory.views.playListGalleryView = Backbone.View.extend({
  tagName:'div',
  id:'play-list-gallery-page',
  templateLoader: directory.utils.templateLoader,
  
  initialize: function() {
    this.collection.bind("reset", this.render, this);
	  this.currentProfil = this.options.currentProfil;
    this.template = _.template(this.templateLoader.get('play-gallery'));
  },

  render: function(eventName) {
    $(this.el).html(this.template({collection: this.collection}));
    return this;
  },
	
	events:{
		'click #descPlayBtn':'showdescPlayModal',
  },
	showdescPlayModal: function(event){
		$("#descPLayModal").modal('toggle');
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
      $("#panel_taxon-detail", this.el).append(new directory.views.GalleryPanel({model:this.model}).render().el); 
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
        $("#panel_taxon-detail", this.el).append(new directory.views.GalleryPanel({model:this.model}).render().el); 
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
  template:'play-gameboard',
  templateLoader: directory.utils.templateLoader,
  itemsCollection : directory.models.ItemsCollection,
  currentScoreGame : directory.models.Score,
  tagName : 'div',
  id: 'play-gameboard',
                                          
  initialize : function() {
	  var self = this;
    this.itemsCollection = new directory.models.ItemsCollection();
    var collectionId = this.model.get('collectionid');
	  var currentCollectionOrdre = this.model.get('ordre');
	  var  nextCollectionOrdre = currentCollectionOrdre+1;
	  this.nextGalleryActive = directory.data.galleriesList.galleryIsActive(nextCollectionOrdre);
	
	  if(typeof(this.options.lastScoreByGallery) !== 'undefined'){
	    this.lastScoreByGallery = this.options.lastScoreByGallery;
	  }
	  else{
	    this.lastScoreByGallery = new directory.models.ScoresCollection();
	    this.lastScoreByGallery.score = 0;
	  }
	
	  if(typeof(this.options.scoreByfk_profil) !== 'undefined'){
	    this.scoreByfk_profil = this.options.scoreByfk_profil;
	  }
	  else{
	    this.scoreByfk_profil = new directory.models.ScoresCollection();
	  }

	  this.ScoreGlobal = this.options.ScoreGlobal;

    this.itemsCollection.findAllByCollectionid(collectionId);
    this.currentProfil = this.options.currentProfil;
    this.currentScoreGame = new directory.models.Score({"fk_profil":this.currentProfil.get('Tprofil_PK_Id'),"fk_gallery":collectionId});
		this.template = _.template(this.templateLoader.get('play-gameboard'));
    this.model.bind("change", this.saveScore, this);

  },
  
  render : function() {
    this.$el.html(this.template( {"gallery": this.model.toJSON(), "profil":this.currentProfil.toJSON(),"score":this.lastScoreByGallery.toJSON(),"allScore":this.ScoreGlobal}));
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
    'click #navigateNewGallery' : 'navigateNewGallery',
		'click #ruleBtn':'toggleRulesModal',
		'click .gameQuit':'showGameQuitModal',
  },
  
  
  beforeClose : function(){
   this.saveScore();
  },
  
  navigateNewGallery : function(){
		
		var nav = new directory.Router;
		var nextCollectionOrdre = this.model.get('ordre')+1;
		var urlNextGallery = directory.data.galleriesList.findWhere( {'ordre': nextCollectionOrdre}).get('collectionid');
		nav.navigate("play/"+urlNextGallery, {trigger: true, replace: true});
  },
  
  returnToGame : function(event){
    d3.select("#gameDetailPanel").classed("hidden",true);
    //window.graph = null;
    //$("#meolGraphDetail").empty();
    d3.select("#gamePanel").classed("hidden",false);
  },                                             
  
  selectRandomContinent: function(event){
		$('#rulesModal').modal('hide');
		d3.select("#map svg").selectAll(".pion").classed("hideInfoContinent",true);
		d3.select("#selectRandomContinent").classed("hidden",true);
		$("#firstMessagePlay").css("display","none");
		$("#continentName").css("display","inherit");

		var arrContinents = d3.select("#map svg").selectAll(".continent");
		var rand = arrContinents[Math.floor(Math.random() * arrContinents.length)];
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
				d3.select(shuffleRand[item]).transition().delay(countReset).style("fill", "#E1FA9F");
				count+= 150;
				countReset+=200;
			};
		};
		
		var currentContinent = shuffleRand[2];
		var currentContinentStr = $("#currentContinent").val();
		var currentContinentShufStr = currentContinent.id;
		if (currentContinentShufStr === 'america-south') currentContinentShufStr = 'south america';
		if (currentContinentShufStr === 'america-north') currentContinentShufStr = 'North America';
		if(typeof(currentContinentStr) !== 'undefined'){
			if(currentContinentShufStr.toLowerCase() == currentContinentStr.toLowerCase()){
			 currentContinent = shuffleRand[2+1];
			};
		};
		
		d3.selectAll(".continent").transition().delay(1600).style("fill", "#E1FA9F");
		d3.select(currentContinent).transition().delay(1600).style("fill", "#B9DE00");

		var currentContinentclass= currentContinent.id;
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
		var currentsc = parseInt($("#scoreTotalValue").val());
		if(currentsc > 0){
			this.currentScoreGame.set('score', currentsc)
			.set('fk_gallery', this.model.get('collectionid'))
			.save();
		}  
  },
  
  updateScore: function(event){
	  var currentsc = parseInt($("#scoreTotalValue").val());
	  var scoreProgressBar = currentsc/200;
	  var scoreProgressTotal= $("#meterScore").css("width");
	  var currentCollectionOrdre = this.model.get('ordre');
	  var nextCollectionOrdre = this.model.get('ordre')+1;
	  //if nextCollection false
  	if (directory.data.galleriesList.galleryIsActive(nextCollectionOrdre) !== 'true') {
		  if(parseInt(scoreProgressBar) >= 100){
		   if(parseInt(nextCollectionOrdre) <= parseInt(directory.data.galleriesList.length)){
			  this.nextCollectionName = directory.data.galleriesList.findWhere( {'ordre': nextCollectionOrdre}).get('name');
			  directory.data.galleriesList.changeGalleryActivateState(nextCollectionOrdre);
			  setTimeout(function(){$("#collectionModal").fadeIn(1000).show(100).alert()},1000);
				setTimeout(function(){$("#collectionModal").animate({top:"0",left:"+=8%",zIndex:"1",width:"-=100px",height:"-=110px",right:"120px",margin:"0px"},500);},3400);
				setTimeout(function(){$("#collectionModal.alert h4").animate({fontSize:"16px",lineHeight:"20px"},500);},3400);
				setTimeout(function(){$("#collectionModal.alert button").animate({fontSize:"14px",padding:"0px"},500);},3400);
			  this.currentScoreGame.set('score', currentsc);
		   }
			setTimeout(function(){$(".progress").fadeIn(1000).css("box-shadow","0px 0px 10px 4px #E2E9EF");},3400);  
			$("#meterScore").css("width",scoreProgressBar+"%");
			setTimeout(function(){$("#meterScore").fadeIn(1000).css("width","100%");},3000);
			setTimeout(function(){$(".progress").fadeIn(1000).css("box-shadow","0px 0px 0px 0px #E2E9EF");},3000);  
			
	    }else{
				$("#meterScore").css("width",scoreProgressBar+"%");
		  };
	  
	  // nextCollection activate TRUE : bonus, GoodSequence equal last value in DB
	  }else{
		  $("#meterScore").fadeIn(1000).css("width","100%");
  	};

	//Mise à jour de la table des scores
    this.currentScoreGame.set('score', currentsc);
    $("#activateCollMessageModal").html("<em>New unlocked collection:<br/>"+this.nextCollectionName+"</em>");
  },
  
  updateNbAnwserGood: function(event){
	  $("#nbAnwserGoodText").html($("#nbAnwserGoodValue").val());
	 //Mise à jour de la table des scores
	  var currentsc = parseInt($("#nbAnwserGoodValue").val());
    this.currentScoreGame.set('nbAnswerGood', currentsc);
  },
  
  updateNbAnwserGoodSequenceValue: function(event){
	  $("#bonusValue").val("0");
	  var nextCollectionOrdre = this.model.get('ordre')+1;
	
	  var scoreTaxon = parseInt($("#scoreTotalValue").val());
	
	  $("#nbAnwserGoodSequenceText").html($("#nbAnwserGoodSequenceValue").val());
	  var currentnbAnswerGoodSequence = $("#nbAnwserGoodSequenceValue").val();
	  var currentnbAnswerGoodRecordSequence = $("#nbAnwserGoodSequenceRecordText").text();
	  var bonusFibo = fiboSuite() ;
	
	  if(parseInt(currentnbAnswerGoodSequence) > parseInt(currentnbAnswerGoodRecordSequence)){
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

		var scoreBonus = parseInt($("#bonusValue").val());
		var score = scoreTaxon + scoreBonus;
		if(score > 0){
			$("#scoreTotalValue").val(score).trigger('change');
			$("#scoreText").html(score);
		}
		if(score === 0 || score > parseInt(this.lastScoreByGallery.score) || score > parseInt(this.lastScoreByGallery.get('score'))){
			var scoreAllGalleries = score + this.ScoreGlobal ;
			$('#allScore').html(scoreAllGalleries); 
		}
		if(parseInt(this.lastScoreByGallery.get('score')) > this.ScoreGlobal){
			var scoreAllGalleries = score;
			$('#allScore').html(scoreAllGalleries); 
		}
		if(score > this.ScoreGlobal){
			var scoreAllGalleries = score;
			$('#allScore').html(scoreAllGalleries); 
		}
	
		//Modal Bonus
		if(scoreBonus > 0){
			$("#bonus").fadeIn(1000).css("box-shadow","0px 0px 12px 6px #E2E9EF");
			setTimeout(function(){$("#bonus").fadeIn(3000).css("box-shadow","0px 0px 0px 0px #E2E9EF");},2400);
			$("#bonusMessageModal").html("+"+scoreBonus+" Bonus series points");
		}
	
  },
  
  loadTaxonPlay: function(event){        
    var currentscnbQuestionTotal = this.currentScoreGame.get('nbQuestionTotal');
    this.currentScoreGame.set('nbQuestionTotal', currentscnbQuestionTotal+1);
		var currentContinentStr = $("#currentContinent").val();
	
		//Recherche jusqu'à 16x si indexId1 est sur le currentContinent
		var selectedItemsCollection = new directory.models.ItemsCollection();
		var indexId1 = Math.floor(Math.random()*this.itemsCollection.models.length);
		var presence = this.itemsCollection.models[indexId1].attributes.iNat.split(",");
		var capCurrentContinent = capitaliseFirstLetter(currentContinentStr);
		var countPresence=0;
		if(typeof(currentContinentStr) !== 'undefined'){
			for (var idNat in presence) {
				if(countPresence > 16 || capCurrentContinent  == presence[idNat] || typeof(presence[idNat]) === 'undefined'){
					break;
				};
				if(typeof(presence[idNat]) != 'undefined'){
					while (capCurrentContinent != presence[idNat]) {
						if(countPresence > 16){
							break;
						};
						indexId1 = Math.floor(Math.random()*this.itemsCollection.models.length);
						var presence = this.itemsCollection.models[indexId1].attributes.iNat.split(",");
						countPresence +=1;
					};
					selectedItemsCollection.models[0] = this.itemsCollection.models[indexId1];
				};	
			};
			
			selectedItemsCollection.models[0] = this.itemsCollection.models[indexId1];
		};
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
    falseItem.set('preferredCommonNames',  "None of these live here");
    selectedItemsCollection.models[3] = falseItem;
    
    //Création de la vue des éléments du jeux
    if (typeof(this.listView) !== 'undefined') {
      this.listView.remove();
    }
    
		//var currentContinentStr = $("#currentContinent").val();
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
	toggleRulesModal: function(event){
		$("#rulesModal").modal('toggle');
	},
	showGameQuitModal: function(event){
		var self = this;
		$("#myModal").modal('hide');
		var nav = new directory.Router;
		var urlClicked = event.currentTarget.id;
		$("#gameQuitModal").modal('show');
		$("#gameQuitValidate").click(function(){
			self.beforeClose();
			nav.navigate("#"+urlClicked, {trigger: true, replace: true});
		});
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
    /*$(".playableTaxonHidden").hide(5);
    $(".playableTaxon").removeAttr('style');*/
    //Mise en avant de l'élément sélectionné
    /*$("#"+target).parent().animate({width:"30%",height:"45%"},500);
    var cssObj={ 'z-index': '5','position': 'relative','margin': '-10% -10% 20px'}
    $("#"+target).parent().css(cssObj);
    $("#"+target).parent().children(".playableTaxonHidden").show(5);*/
  },
       
   
  validateItem: function(event){
		$('#rulesModal').modal('hide');
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
    $("#item-"+currentObjectId).addClass("gameFalseSelectedItem");
    
    var currentContinentStr = $("#currentContinent").val();
    var weightTaxonIucn = 0;
		var weightTaxonContinent = 0;
    
    //Selection des items corrects pour ce continent
    var correctItems = new Array();
    var existTrueResponse = false;
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
					var weightTaxonIucn = idTaxon.get('weightIucn');
					var weightTaxonContinent = idTaxon.attributes.weightContinent;
        };
      };
    };
	
	
    var found = false;
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
				$("#reponseMessageModal").before('<h5>Correct answers were...</h5>');
			}else{
				var weightNbPossibilyties = 0;
				$("#reponseMessageModal").before('<h5>The correct answer was...</h5>');
			}
		};
		
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
        $("#item--1").addClass("gameTrueSelectedItem ");
				$("#reponseMessageModal").append('<li>'+this.model.models[id].attributes.preferredCommonNames+'</li>');
      }
			var currentScore = parseInt($("#scoreTotalValue").val());
			$("#scoreTotalValue").val(currentScore+0).trigger('change');
			//nb NbAnwserGood
			var currentNbAnwserGood = parseInt($("#nbAnwserGoodValue").val());
			$("#nbAnwserGoodValue").val(currentNbAnwserGood+0).trigger('change');
			$("#myModal").removeAttr('style');
			//nb nbAnwserGoodSequence
			$("#nbAnwserGoodSequenceValue").val(0).trigger('change');
			//Message Modal
			$("#txtMessageModal").html("<span id ='sorry'>Sorry!</span>");
    }
    else {
		if(weightTaxonContinent > 1){
		  var ponderationContinent = weightTaxonContinent*10;
		}else{
		  var ponderationContinent = 0;
		};
		if(weightTaxonIucn > 1){
		  var ponderationIucn = weightTaxonIucn*10;
		}else{
		  var ponderationIucn = 0;
		};
    var currentScore = parseInt($("#scoreTotalValue").val());
		var currentPonderation = weightNbPossibilyties + ponderationContinent + ponderationIucn;
    $("#scoreTotalValue").val(currentScore+1000-currentPonderation).trigger('change');
		//nb nbAnwserGood
		var currentNbAnwserGood = parseInt($("#nbAnwserGoodValue").val());
    $("#nbAnwserGoodValue").val(currentNbAnwserGood+1).trigger('change');
		//nb nbAnwserGoodSequence
		var currentNbAnwserGood = parseInt($("#nbAnwserGoodSequenceValue").val());
    $("#nbAnwserGoodSequenceValue").val(currentNbAnwserGood+1).trigger('change');
		
		$("#myModal").css("box-shadow","0px 0px 25px 10px white")
		
		//Message succes Modal
		$("#txtMessageModal").html("Well Done!");
		//Ne pas afficher la ou les bonnes reponses
		$("#myModal h5").remove();
		$("#reponseMessageModal").html("");
		$("#scoreMessageModal").html(1000-currentPonderation+" points");
    };
    
    d3.select("#selectRandomContinent").classed("hidden",false);
    $("#myModal").modal('show');
    /*$(".playableTaxon").not(".gameTrueSelectedItem").children(".playableTaxonHidden").hide(5);
    $(".playableTaxon").not(".gameTrueSelectedItem").removeAttr('style');*/
    
    //désactive les événements pour que le joueur ne puisse pas rejouer
    $(".playableTaxonValidate").addClass("disabled");
  },
});

directory.views.ProfilDetailView =  directory.views.BaseView.extend({
  template: 'profil-page',
  
  initialize: function() {
  
  },
  
 beforeRender: function() {
		var collection = new directory.models.ScoresCollection();
		var deferred = collection.findAllScoreByProfilId(this.model.get('Tprofil_PK_Id'));
		var self = this;
		deferred.done(function(items) {
			var score = 0;
			var ordreMax = 1;
			_.each(items, function(item) {
				var ordreCurrent = directory.data.galleriesList.galleryOrdreById(String(item.fk_gallery));
				if(ordreCurrent > ordreMax){
					ordreMax = ordreCurrent;
				};
				score += item.score_max;	
			});
			var lastActiveGalleryName = directory.data.galleriesList.findWhere({'ordre' : parseInt(ordreMax)}).get('name');
			self.insertView("#profileTable", new directory.views.TableProfilDetailView({collection:items,model:self.model, lastActiveGalleryName :lastActiveGalleryName, scoreTotal : score })).render();
		});
  },
	
  serialize: function() {
    return {model:this.model};
  },
  
  events:{
    'click #pseudo': 'showModalPseudo',
    'click #profileSubmitModal': 'profileSubmitModal',
  },
  
  showModalPseudo : function(event){
		$("#profileModal").modal('show');
	},
	
	profileSubmitModal : function(event){
		var profileTextModal = $("input#profileTextModal").val();
		console.log(typeof(profileTextModal));
		if(profileTextModal !== ""){
			$("#pseudo").html(profileTextModal);
			this.model.set('Tprofil_PK_Id', parseInt(this.model.get('Tprofil_PK_Id')))
			.set('pseudo', String(profileTextModal))
			.save();	
		}
	},

   
});

directory.views.TableProfilDetailView =  directory.views.BaseView.extend({
 template: 'profil-table',
 
 initialize: function() { 
	 this.scoreTotal = this.options.scoreTotal;
   this.lastActiveGalleryName = this.options.lastActiveGalleryName;
   this.model.bind("reset", this.render, this);
 },  
 serialize: function() {
   return {collection:this.collection,scoreTotal : this.scoreTotal, lastActiveGalleryName :  this.lastActiveGalleryName };
 },

});

directory.views.feedbackView =  directory.views.BaseView.extend({
  template: 'feedback-page',
});
directory.views.creditPageView =  directory.views.BaseView.extend({
  template: 'credit-page',
});
