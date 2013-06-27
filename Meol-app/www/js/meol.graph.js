"use strict";
/**
 * Return a new instance of an MeolGraph object.
 * 
 * @param containerId The id of the HTML element to be used as the graph container. 
 * @param options     The options to initiate the MeolGraph object with. 
 */
var MeolGraph = function(containerId, options) {

  // Init graph container element id property:
  this.containerId             = document.getElementById(containerId);
  this.svgcontainerId          = options.svgcontainerId || "meol-graph";
  // Fill object properties with option values:
  // REFACTOR: stuff all this in an 'options' property
  this.dataSource              = options.dataSource;
  this.canvasWidth             = options.canvasWidth || heightScreen;
  this.canvasHeight            = options.canvasHeight || widthScreen;
  this.charge                  = options.charge || -1200;
  this.distance                = options.distance || 100;
  this.nodeBoxRx               = options.nodeBoxRx || 10;
  this.nodeBoxRy               = options.nodeBoxRy || 10;
  this.nodeBoxWidth            = options.nodeBoxWidth || 110;
  this.nodeNonLeafHeight       = options.nodeNonLeafHeight || 30;
  this.nodeLeafHeight          = options.nodeLeafHeight || 90;
  this.nodeLabelXOffset        = options.nodeLabelXOffset || 10;
  this.nodeLabel2YLeafOffset   = options.nodeLabel2YLeafOffset || 24;
  this.nodeLabelYLeafOffset    = options.nodeLabelYLeafOffset || 12;
  this.nodeLabelYNonLeafOffset = options.nodeLabelYNonLeafOffset || 17;
  this.nodeExpandCircleXOffset = options.nodeExpandCircleXOffset || 92;
  this.nodeExpandCircleYOffset = options.nodeExpandCircleYOffset || 15;
  this.nodeExpandCircleR       = options.nodeExpandCircleR || 10;
  this.nodeImageWidth          = options.nodeImageWidth || 104;
  this.nodeImageHeight         = options.nodeImageHeight || 67;
  this.nodeImageXOffset        = options.nodeImageXOffset || 3;
  this.nodeImageLeafYOffset    = options.nodeImageLeafYOffset || 3;
  this.nodeTextHeight          = options.nodeTextHeight || 10;
  this.charaterSplitNb         = options.charaterSplitNb || 18;
  this.currentNode             = options.currentNode || null;
  this.init();  
};//end constructor


/** 
 * Init (data and layout) and display the graph.
 */
MeolGraph.prototype.init = function() {

  var self = this;

  // Init SVG canvas:
  this.vis = d3.select(this.containerId).append("svg:svg")
       .call(d3.behavior.zoom()
          .on("zoom",  function() {
          self.vis.attr(
            "transform",
            "translate(" + d3.event.translate + ")"
            + " scale(" + d3.event.scale + ")");

        }))
        .attr("width", this.canvasWidth)
        .attr("height", this.canvasHeight)
        .attr("id", this.svgcontainerId)
        .append('svg:g');

  // Init force-directed layout:
  this.force = d3.layout.force().on("tick", function() {

    self.link.attr("x1",  function(d) { return d.source.x + 55; })
        .attr("y1", function(d) { return d.source.y+self._computeNodeHeight(d.source)/2; })
        .attr("x2",  function(d) { return d.target.x + 55; })
        .attr("y2", function(d) { return d.target.y +self._computeNodeHeight(d.target)/2; });

    self.graphNodes.attr("x", function(d) { return d.x; })
              .attr("y", function(d) { return d.y; });

  }).size([this.canvasWidth, this.canvasHeight]);

  // Populate graph from JSON and collapse the root node:
  d3.json(this.dataSource, function(json) {
    self.root = json;
    // Collapse the root node:
    self.root._children = self.root.children;
    self.root.leaves = self._getLeaves(self.root);
    self.root.children = self.root.leaves;
    self._update();
  });

};//end function init()

MeolGraph.prototype._update = function() {

  var self = this;
  this.dataNodes = this._flatten(this.root);
  this.links = d3.layout.tree().links(this.dataNodes);
  
  // Update the links:
  this.link = this.vis.selectAll("line.link")
      .data(this.links, function(d) { return d.target.id; });

  this.link.enter().insert("svg:line" , ".node")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .attr("class", "link");

  // Exit any old links.
  this.link.exit().remove();
  // Restart the force layout:
  this.force
  .nodes(this.dataNodes)
  .links(this.links)
  .charge(this.charge)
  .distance(this.distance)
  .start();
  

  // Update the nodes	:
  this.graphNodes = this.vis.selectAll("svg.node")
      .data(this.dataNodes, function(d) { return d.id; });

  this.node = this.graphNodes
      .enter().append("svg:svg")
      .attr("class", "node")
      .attr("id", function(d) { return d.taxonConceptID; })
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
  
  //Terminal node event only : drag
  this.node.filter(function(d, i) { return (typeof d.image !== "undefined") & 1; })
      .call(this.force.drag);

  // Register touchstart event listener for IOS (change this to click for desktop):
  var event='click';
  if (document.documentElement.hasOwnProperty('ontouchstart')) event = 'touchstart';
  this.node.on(event, function(clickedNode, i) {
    var taxon;
    if (typeof clickedNode.taxonConceptID !== "undefined") {
      var clickedNodeTaxonConceptId = clickedNode.taxonConceptID;
      var taxonConceptID = clickedNodeTaxonConceptId.toString();
      //taxon = taxonDetailData[taxonConceptID];
      var taxon = new directory.models.Taxon({id:clickedNodeTaxonConceptId, taxonConceptId: clickedNodeTaxonConceptId});
      taxon.fetch({
        add:true,
        success: function(data) {
         // this.listView = new directory.views.TaxonPanel({model:taxon});
          //Change the css class of the old selected node
          $('#meolGraphContainer svg#'+ self.currentNode+' rect').attr("class","child");
          //Change the css class of the current selected node
          $("rect").attr("style","");
          $('#meolGraphContainer svg#'+clickedNode.taxonConceptID+' rect').attr("style","fill: #B9DE00;");
          self.currentNode =  clickedNode.taxonConceptID;
          //Selectionne la photo de la collection au lieu de celle du taxon
          if (typeof clickedNode.image  !== 'undefined') taxon.set('image_fileName', clickedNode.image ); 
          //Load taxon panel detail
          $("#panel_taxon-detail").empty();
          $("#panel_taxon-detail").append( new directory.views.TaxonPanel({model: data}).render().el);

        }
      });
    }
               
    // The node is a not leaf, and not a penultimate expand or collapse it:
    if (!clickedNode.terminal || self._isPenultimate(clickedNode) == true) {
      // The node is expanded, if not penultimate, let's collapse it and its child:
      // REFACTOR: combine the following block in a refactored (recursive) collapseNode function: 
      if (clickedNode.expanded && self._isPenultimate(clickedNode) == false) {
        self._collapseNode(clickedNode);
        $.each(clickedNode._children, function(index, child) {
          self._collapseNode(child);
          self._markChildrenAsNotExpanded(child)
        });
      }
      // The node is collapsed ans is not penultimate, expand it:
      else {  
        self._expandNode(clickedNode);
      }

      // Adjust the expand icon label ("+", "-" or "") according to the node status (expanded, penultimate):
      self.graphNodes.selectAll("text.expand-icon").text(function(d) { 
        var isPenultimate = self._isPenultimate(d);
        if (!d.expanded && !isPenultimate) {
          return "+";
        }
        else {
          return isPenultimate?"":"-"; 
        }
      });
    }

  });// end click event registration

  this.node.append("svg:rect")
    .attr("height", function(d) {
      return self._computeNodeHeight(d);
    })
    .attr("width", this.nodeBoxWidth)
    .attr("class",  "child" )
    .attr("rx", this.nodeBoxRx)
    .attr("ry", this.nodeBoxRY)
    .attr("id",  function(d) { 
      return (d.depth==0 || d.depth==-1)?"root":"" ;
    }) ;    
 // Node label:
  var commontext = this.node.append("svg:text")
      .attr("x", self.nodeLabelXOffset)
      .attr("y", function(d) { return self.nodeLabelYLeafOffset; })
      .attr("class",  function(d) { return (typeof d.terminal === "undefined")?"common-name intermediary":"common-name terminal" });
      
  commontext.append("svg:tspan")
      .attr("x", self.nodeLabelXOffset)
      .attr("dy", 0)
      .text(function(d) { return (typeof d.splitVernacularName === "undefined")?"":d.splitVernacularName[0]; });

  commontext.append("svg:tspan")
      .attr("x", self.nodeLabelXOffset)
      .attr("dy", self.nodeTextHeight)
      .text(function(d) {  
        if (typeof d.splitVernacularName === "undefined") return "";
        else    return  (typeof d.splitVernacularName[1] === "undefined")?"":d.splitVernacularName[1]; 
      });
      
  commontext.append("svg:tspan")
      .attr("x", self.nodeLabelXOffset)
      .attr("dy", self.nodeTextHeight)
      .text(function(d) {  
        if (typeof d.splitVernacularName === "undefined") return "";
        else    return  (typeof d.splitVernacularName[2] === "undefined")?"":d.splitVernacularName[2]; 
      });
      
   // Second part of the node label:
  var scitext = this.node.append("svg:text")
      .attr("x", self.nodeLabelXOffset)
      .attr("y", function(d) { 
        if (typeof d.vernacularName === "undefined") {
          return self.nodeLabelYLeafOffset; 
        }
        else {
           return (self.nodeLabelYLeafOffset + (d.vernacularLineNb)*10);
        }; 
      })
      .attr("class",  "scientific-name");
      
    scitext.append("svg:tspan")
      .attr("x", self.nodeLabelXOffset)
      .attr("dy", 0)
      .text(function(d) {  return (d.splitName[0]); });
    
    scitext.append("svg:tspan")
      .attr("x", self.nodeLabelXOffset)
      .attr("dy", self.nodeTextHeight)
      .text(function(d) {  return  (typeof d.splitName[1] === "undefined")?"":d.splitName[1]; });
    
    scitext.append("svg:tspan")
          .attr("x", self.nodeLabelXOffset)
          .attr("dy", self.nodeTextHeight)
          .text(function(d) {  return  (typeof d.splitName[2] === "undefined")?"":d.splitName[2]; });

  // Expand/collapse icon circle:
  this.node.filter(function(d, i) { return (d.terminal != true) & 1; })
      .append("svg:circle")
      .attr("cx", self.nodeExpandCircleXOffset)
      .attr("cy", self.nodeExpandCircleYOffset)
      .attr("r", self.nodeExpandCircleR)
      .attr("class",  "expand-icon-circle" )
      // REFACTOR: use "visibility" attribute instead of "fill-opacity": 
      .attr("fill-opacity", function(d) { return (typeof d.terminal==="undefined") && (!self._isPenultimate(d) || d.depth ==0)?1:0 });

  // Expand/collapse icon label (can be "+", "-" or ""):
  this.node.filter(function(d, i) { return (d.terminal != true) & 1; })
      .append("svg:text")
      .attr("x", self.nodeExpandCircleXOffset - 2)
      .attr("y", self.nodeLabelYNonLeafOffset)
      .attr("class",  "expand-icon" )
      .attr("fill",  "white" )
      // The root node gets a "+" label:
      .text(function(d) { return (d.depth==0)?"+":"" });

  // Select only the node with a defined image attibute And append to them a svg:image
  this.node.filter(function(d, i) { return (typeof d.image !== "undefined") & 1; })
      .append("svg:image")
        .attr("xlink:href", function(d) { return (typeof d.image !== "undefined")?"data/images_taxon/"+d.image:"" })
        .attr("x", self.nodeImageXOffset)
        .attr("y", function(d) { return 30 + (d.vernacularLineNb-1)*self.nodeTextHeight + (d.scientificLineNb-1)*self.nodeTextHeight;})
        .attr("width", self.nodeImageWidth)
        .attr("height", self.nodeImageHeight);
    
  // Exit any old nodes.
  this.graphNodes.exit().remove();
  
 

};//end function _update()

/**
 * Helper method - Return the correct height for a given node depending on its properties.
 * 
 * @param node The node which height is to be returned. 
 * @return The correct height for a given node depending on its properties.
 */
MeolGraph.prototype._computeNodeHeight = function(node) {

  var self = this;
  var baseHeight = this.nodeNonLeafHeight; 
  var nodeLabel2Y = this.nodeLabel2YLeafOffset;

  if (typeof node.splitName==="undefined") {
    var splitName = self._splitText2Tspan(node.name, self.charaterSplitNb);
   node.splitName = splitName;
    node.scientificLineNb = node.splitName.length;
  }
  if  ((typeof node.vernacularName!=="undefined") && (typeof node.splitVernacularName==="undefined")) {
    var splitVernacularName = self._splitText2Tspan(node.vernacularName, self.charaterSplitNb);
    node.splitVernacularName = splitVernacularName;
    node.vernacularLineNb = node.splitVernacularName.length;
  }
  if (typeof node.vernacularLineNb==="undefined") {
    node.vernacularLineNb = 0;
  } 
 if (node.terminal == true) { 
    baseHeight = this.nodeLeafHeight; 
  }
 else {
    nodeLabel2Y  = 0;
  }
  
  baseHeight = baseHeight + (node.scientificLineNb-1)*self.nodeTextHeight + (node.vernacularLineNb-1)*self.nodeTextHeight;
  
  if (baseHeight< self.nodeNonLeafHeight) baseHeight = self.nodeNonLeafHeight;
  return (typeof node.name==="undefined") ? baseHeight:baseHeight + nodeLabel2Y;


};//end function _computeNodeHeight(node) 


MeolGraph.prototype.refreshCurrentNode = function(newNode) {
  var self = this;
  self.currentNode = newNode; 
  self._update();  
};

MeolGraph.prototype.displayPanel = function(clickedNodeTaxonConceptId, alternateFile ) {
 //taxon = taxonDetailData[taxonConceptID];
  var taxon = new directory.models.Taxon({id:clickedNodeTaxonConceptId, taxonConceptId: clickedNodeTaxonConceptId});
  taxon.fetch({
    add:true,
    success: function(data) {
      // this.listView = new directory.views.TaxonPanel({model:taxon});
      //Change the css class of the old selected node
      $('#meolGraphContainer svg#'+ clickedNodeTaxonConceptId+' rect').attr("class","child");
      //Change the css class of the current selected node
      $("rect").attr("style","");
      $('#meolGraphContainer svg#'+clickedNodeTaxonConceptId+' rect').attr("style","fill: #B9DE00;");
      //Selectionne la photo de la collection au lieu de celle du taxon
      if (typeof alternateFile  !== 'undefined') taxon.set('image_fileName', alternateFile); 
      //Load taxon panel detail
      $("#panel_taxon-detail").empty();
      $("#panel_taxon-detail").append( new directory.views.TaxonPanel({model: data}).render().el);
    }
  });
};

d3.selection.prototype.moveToFront = function() { 
  return this.each(function() { 
    this.parentNode.appendChild(this); 
  }); 
}; 

MeolGraph.prototype.changeCurrentNode = function(nodeId) {
  this.currentNode = nodeId;
  this._update();
};
/** 
 * Return a list of all descendant nodes under the root.
 *
 * @param node The node which descendant node list is to be returned. 
 * @return A list of all descendant nodes under the root.
 */
MeolGraph.prototype._flatten = function(root) {

  var nodes = [];

  function _flattenRecurse(node) {
    if (node.children) 
      node.children.forEach(_flattenRecurse);
    nodes.push(node);
  }

  _flattenRecurse(root);

  return nodes;

};//end function _flatten(root)

/** 
 * Mark all descendant nodes as not expanded (i.e. set expanded property to false).
 *
 * @param root The node which all descendant node are to be marked as not expanded. 
 */
MeolGraph.prototype._markChildrenAsNotExpanded = function(root) {

  function recurse(node) {
    if (node._children) 
      node._children.forEach(recurse);
    node.expanded = false; 
  }

  recurse(root);

};//end function _markChildrenAsNotExpanded(root)

/** 
 * Return a list of all leaf nodes under the root.
 *
 * @param node The node which leaf node list is to be returned. 
 * @return A list of all leaf nodes under the root.
 */
MeolGraph.prototype._getLeaves = function(node) {

  var nodes = [];

  function _getLeavesRecurse(node) {
    if (node.children) {
      node.children.forEach(_getLeavesRecurse);
    }
    else {
      nodes.push(node);
    }
  }
  if (!node.terminal) {
    _getLeavesRecurse(node);
  }

  return nodes;

};//end function _getLeaves(node)

/** 
 * Return true if the node is penultimate. Else return false.
 *
 * @param node The node which penultimate property is to be determined. 
 * @return true if the node is penultimate. Else return false.
 */
MeolGraph.prototype._isPenultimate = function(node) {

  var isPenultimate = true;

   if (node._children) {
     node._children.forEach(function(child) {
       if (!child.terminal) {
         isPenultimate = false;
       }
     });
  }

  return isPenultimate;

};//end function _isPenultimate(node)

MeolGraph.prototype._updateAllExpandCollapseIcone = function() {
  var self = this;
  // Adjust the expand icon label ("+", "-" or "") according to the node status (expanded, penultimate):
  self.graphNodes.selectAll("text.expand-icon").text(function(d) { 
    var isPenultimate = self._isPenultimate(d);
    if (!d.expanded && !isPenultimate) {
      return "+";
    }
    else {
      return isPenultimate?"":"-"; 
    }
  });
};

/** 
 * Collapse given node.
 *
 * @param node The node to be collapsed. 
 */
MeolGraph.prototype._collapseNode = function(node) {

  if (!node.terminal) {
    node.children = node.leaves;  
    node.expanded = false; 
   this._update();
  }

};//end function _collapseNode(node)

/** 
 * Expand given node.
 *
 * @param node The node to be expanded. 
 */
MeolGraph.prototype._expandNode = function(node) {
  var self = this;
  if (!node.terminal) {
     var children = [];
     $.each(node._children, function(index, child) {
      if (!child.hasBeenExpanded) {
        // Cache the leaves:
        child.leaves =self._getLeaves(child);
        // Cache the children:
        child._children = child.children;
        child.hasBeenExpanded = true;
      }
      child.children = child.leaves;
      children.push(child)
    });
    node.children = children;
    node.expanded = true;
    // Mark the node as having been expanded:
    node.hasBeenExpanded = true;
   this._update();
  }//end if (!node.terminal)

};//end function _expandNode(node)

/**
 * Expand all nodes of the graph
 *
 * @param node The root to be expanded.
 */
MeolGraph.prototype._expandAllNodes = function(node) {
  if (! node) node = this.root;
    var self = this;
  function recurse(node) {
    if (!node.terminal) {
      var children = [];
      $.each(node._children, function(index, child) {
             if (!child.hasBeenExpanded) {
             // Cache the leaves:
             child.leaves =self._getLeaves(child);
             // Cache the children:
             child._children = child.children;
             child.hasBeenExpanded = true;
             }
             child.children = child.leaves;
             children.push(child)
             });
      node.children = children;
      node.expanded = true;
      // Mark the node as having been expanded:
      node.hasBeenExpanded = true;
      if (node.children) {
        node.children.forEach(recurse);
      }
    }//end if (!node.terminal)
  }
  
  recurse(node);
  //Set to null the current Node
  self.currentNode = null;
  this._update();
  this._updateAllExpandCollapseIcone();
};

/**
 * Collapse all nodes of the graph
 *
 * @param node The root to be collapsed.
 */
MeolGraph.prototype._collapseAllNodes = function(node) {
  if (! node) node = this.root;
  var self = this;
  
  function recurse(node) {
    if (!node.terminal) {
      node.children = node.leaves;
      node.expanded = false;
    }
    if (node.children) {
      node.children.forEach(recurse);
    }
  }
  
  recurse(node);
  //Set to null the current Node
  self.currentNode = null;
    // Init force-directed layout:
  this._update();
  this._updateAllExpandCollapseIcone();
  //$('#meol-graph g').attr("transform","translate(0,0) scale(1)");
  
  this.vis.attr("transform","translate(0,0) scale(1)");
  
 // d3.behavior.zoom.scale(1);//.translate([0, 0]);
  //this.vis.attr("scale", 0);
};//end function _collapseNode(node)

/**
 * Découpe une chaine de caractère tout les 25 caractères
 * Pour que cela rentre dans le rectangle
 * **/
MeolGraph.prototype._splitText2Tspan = function (name, len) {
  //var name = node.name;
  var splitname = new Array();
  var middleString= "";
  var segNb = 0;
  var segment = 0;
  var tabWord = name.split(" ");
  for(var i=0;i<tabWord.length;i++){
    segment = segment + tabWord[i].length;
    if (segment>len) {
      splitname[segNb] = trim(middleString);
      segment = tabWord[i].length;
      segNb =segNb+1;
      middleString = tabWord[i]+' ' ;
    }
    else {
      middleString+= tabWord[i]+' ';
    }
  }
  splitname[segNb] = middleString;
 return splitname;
};

function trim (myString) {
  return myString.replace(/^\s+/g,'').replace(/\s+$/g,'')
} ;
