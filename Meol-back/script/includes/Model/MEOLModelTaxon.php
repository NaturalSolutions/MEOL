<?php

//require_once('../UtilsInput.php');
require_once('MEOLModelObjectImage.php');
require_once('MEOLModelObjectText.php');

class ModelTaxon {
	private $_collectionid; //String
	private $_pageid; //integer
	private $_taxonConceptId; //integer
	private $_taxonName; //String
	private $_textDesc; //ObjectText
	private $_flathierarchy; //array()
	private $_preferedCommonName;
	private $_image;//ObjectImage
	private $_iucnStatus;//ObjectText
	private $_terminal;//ObjectText
	
	private $_preferedRef = 'Species 2000 & ITIS Catalogue of Life: May 2012';
	
	public function __construct($collectionid,$pageid,$taxonConceptId,$taxonName,$textDesc,$flathierarchy,$preferedCommonNames,$image,$iucnStatus,$terminal) {
    $this->_collectionid=$collectionid;
    $this->_pageid=$pageid;
    $this->_taxonConceptId=$taxonConceptId;
    $this->_taxonName=$taxonName;
    $this->_textDesc=$textDesc;
    
    $hierarchy  = array();
    if ($flathierarchy !== '') $hierarchy =  (array) json_decode($flathierarchy);
    $hierarchy = array_reverse($hierarchy);
    $taxHier = array();
    foreach($hierarchy as $val) {
      if (isset($val->taxonID)) {
        if($val->taxonID == $this->_taxonConceptId) {
          break;
        }
        else $taxHier[] = $val;
      }

    }
    
    $this->_flathierarchy=$taxHier;
    
    $prefered  = array();
    if ($preferedCommonNames !== 'False') $prefered =  (array) json_decode ($preferedCommonNames);
    $this->_preferedCommonName=$prefered;
    
    $this->_image=$image;
    $this->_iucnStatus=$iucnStatus;
    $this->_terminal =$terminal;
  }
  
  public function save2BD($terminal){
    // on se connecte à MySQL    
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);
     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Taxon` (`pageid`, `taxonConceptId`, `taxonName` , common_name_prefered, `flathierarchy`, `terminal`) VALUES (';
    $sql .= $this->_pageid .' , '.$this->_taxonConceptId.','."'".mysql_real_escape_string($this->_taxonName, $db )."',";
    $sql .= "'".mysql_real_escape_string(json_encode ($this->getPreferedCommonName(), JSON_HEX_QUOT), $db )."',";
    $sql .= "'".mysql_real_escape_string(json_encode ($this->_flathierarchy, JSON_HEX_QUOT), $db )."',". $terminal.')';
    //$this->_utils->sendQuery($sql);
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }

  public function formatTaxonDetailPanel() {
    //Récupếration des objets;
    $desc = $this->getTextDesc();
    $img = $this->getImage();
    $iucn = $this->getIucnStatus();
    
    $flathier = $this->getFlathierarchy();
        
    $description ='';
    $image ='';
    $iucnStatus = '';
    if (isset($desc)) $description = $desc->getFormatedObject();
    if (isset($img)) $image = $img->getFormatedObject();
    if (isset($iucn)) $iucnStatus = $iucn->getFormatedObject();
    $taxonDetail = array(
      'collectionid' => $this->getCollectionid(),
      'pageid' => $this->getPageid(),
      'taxonConceptId' => $this->getTaxonConceptId(),
      'taxonName' => $this->getTaxonName(),
      'textDesc' => $description,
      'flathierarchy' => $flathier,
      'preferredCommonNames' => $this->getPreferedCommonName(),
      //'commonNames' => $taxon->getCommonNames(),
      'image' => $image,
      'iucnStatus' => $iucnStatus,
      'image' => $image,
    );

    return $taxonDetail;
  }
 
 
  public function formatTaxonDetailPanel2() {
    //Récupếration des objets;
    $desc = $this->getTextDesc();
    $img = $this->getImage();
    $iucn = $this->getIucnStatus();
    
    $flathier = $this->getFlathierarchy();
    $common = '';
   /* print_r($this->_preferedCommonName);
    print "\n";*/
    if (isset($this->_preferedCommonName['vernacularName'])) {
      $common = $this->_preferedCommonName['vernacularName'];
    }

    $taxonDetail = array(
      'collectionid' => $this->getCollectionid(),
      'pageid' => $this->getPageid(),
      'taxonConceptId' => $this->getTaxonConceptId(),
      'taxonName' => $this->getTaxonName(),
      'flathierarchy' => $flathier,
      'preferredCommonNames' => $common ,
    );

    if (isset($desc)) {
      $description = $desc->getFormatedObject();
      $taxonDetail['textDesc_objectid'] = $description['objectId'];
      $taxonDetail['textDesc_title'] = $description['title'];
      $taxonDetail['textDesc_credits'] = $description['credits'];
      $taxonDetail['textDesc_description'] = $description['description'];
    }
    else {
      $taxonDetail['textDesc_objectid'] = "";
      $taxonDetail['textDesc_title'] = "";
      $taxonDetail['textDesc_credits'] = "";
      $taxonDetail['textDesc_description'] = "";
    }
    if (isset($iucn)) {
      $iucnStatus = $iucn->getFormatedObject();
      $taxonDetail['iucnStatus'] = $iucnStatus['description'];
    }
    else {
      $taxonDetail['iucnStatus'] = "";
    }
    if (isset($img)) {
      $image = $img->getFormatedObject();
      $taxonDetail['image_objectid'] = $image['objectId'];
      $taxonDetail['image_title'] = $image['title'];
      $taxonDetail['image_credits'] = $image['credits'];
      $taxonDetail['image_fileName'] = $image['fileName'];
    }
    else {
      $taxonDetail['image_objectid'] = "";
      $taxonDetail['image_title']  = "";
      $taxonDetail['image_credits'] = "";
      $taxonDetail['image_fileName'] = "";
    }
   
    return $taxonDetail;
  }
   
 /******************************************************
 ******************************************************
 *           ACCESSEURS
 ******************************************************
 ******************************************************/

  public function getPageid() {
    return $this->_pageid;
  }
  public function getCollectionid() {
     return $this->_collectionid;
  }
  public function getTaxonConceptId() {
     return $this->_taxonConceptId;
  }
  public function getTaxonName() {
     return $this->_taxonName;
  }
  public function getFlathierarchy() {
    return $this->_flathierarchy;
  }
  public function getImage() {
    return $this->_image;
  }
  public function getTextDesc() {
    return $this->_textDesc;
  }
  public function getPreferedCommonName() {
    return $this->_preferedCommonName;
  }
  public function getIucnStatus() {
    return $this->_iucnStatus;
  }
  
      
  public function setPageid($val) {
    $this->_pageid=$val;
  }
  public function setCollectionid($val) {
     $this->_collectionid=$val;
  }
  public function setTaxonConceptId($val) {
     $this->_taxonConceptId=$val;
  }
  public function setTaxonName($val) {
     $this->_taxonName=$val;
  }
  public function setFlathierarchy($val) {
    $this->_flathierarchy=$val;
  }
  public function setImage($val) {
    $this->_image=$val;
  }
  public function setTextDesc($val) {
    $this->_textDesc=$val;
  }
  public function setPreferedCommonName($val) {
    $this->_preferedCommonName=$val;
  }
  public function setIucnStatus($val) {
    $this->_iucnStatus = $val;
  }

}
