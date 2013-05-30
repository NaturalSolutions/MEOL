<?php

require_once('MEOLObjectImage.php');
require_once('MEOLObjectText.php');

class Taxon {
	private $_collectionid; //integer
	private $_pageid; //integer
	private $_taxonConceptId; //integer
	private $_taxonName; //String
	private $_textDesc; //ObjectText
	private $_flathierarchy; //array()
	private $_commonNames = array();
	private $_image;//ObjectImage
	private $_iucnStatus;//ObjectText
  private $_objectType;
	
	private $_utils;
	private $_preferedRef;
	
	public function __construct($pageid, $collectionId, $flathierachy=0, $preferedRef = 'Species 2000 & ITIS Catalogue of Life: April 2013', $terminal=1, $objectType='Taxon') {
    $this->_utils = new Utils();
    $this->_collectionid = $collectionId;
    $this->_preferedRef = $preferedRef;
    print $objectType."\n";
    $this->_objectType = $objectType;
    $this->setPageid($pageid);
    $this->loadAndExtractTaxonData($flathierachy);
    if ($terminal !== 1) $this->save2BD($terminal);
  }
  
  public function save2BD($terminal){
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);
    
    $iucn= '';
    $textDesc= '';
    $image= '';
    if (isset($this->_iucnStatus)) $iucn = $this->_iucnStatus->getObjectId();
    if (isset($this->_textDesc)) $textDesc = $this->_textDesc->getObjectId();
    if (isset($this->_image)) $image = $this->_image->getObjectId();
    
     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Taxon` (`pageid`, `taxonConceptId`, `taxonName` , common_name_prefered, `flathierarchy`, `terminal`, 
      fk_collection, fk_text, fk_image, fk_iucn) VALUES (';
    $sql .= $this->_pageid .' , '.$this->_taxonConceptId.','."'".mysql_real_escape_string($this->_taxonName, $db )."',";
    $sql .= "'".mysql_real_escape_string(json_encode ($this->getPreferedCommonName(), JSON_HEX_QUOT), $db )."',";
    $sql .= "'".mysql_real_escape_string(json_encode ($this->_flathierarchy, JSON_HEX_QUOT), $db )."',". $terminal.', '.$this->_collectionid;
    $sql .= ", '".$textDesc."', ";
    $sql .= "'".$image."', ";
    $sql .= "'".$iucn."')";

    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }

  public function loadAndExtractTaxonData($flatHierarchy) {
    $pagesWS = file_get_contents('http://eol.org/api/pages/1.0/'. $this->_pageid.'.json?common_names=all&details=0&images=1&subjects=overview&text=1&vetted=1&iucn=true');
    print "\n".'http://eol.org/api/pages/1.0/'. $this->_pageid.'.json?common_names=all&details=0&images=1&subjects=overview&text=1&vetted=1&iucn=true'."\n";
    $pageData = json_decode($pagesWS);
    $this->_taxonName = $pageData->scientificName;
    print $this->_taxonName."\n";
    //Récupération des noms communs
    $this->_commonNames = $pageData->vernacularNames;
    
    //Récupération du taxonConcept
    foreach($pageData->taxonConcepts as $txConcept) {
			if ($txConcept->nameAccordingTo == $this->_preferedRef) {
				$this->_taxonConceptId =  $txConcept->identifier;
      }
    }
    //Récupération des données relatives au taxonConcept
    //Si pas de hiérarchie => appel au WS hierarchy_entries
    if (($flatHierarchy==0) && (isset($this->_taxonConceptId))){
      $this->loadAndBuildHierarchyData ();
    }
    else {
    //Si la hiérachie est passée en paramètre
      $this->_flathierarchy = $flatHierarchy;
    }
    
    if (! isset($this->_taxonConceptId)){
      $this->_taxonConceptId= 0;
    }
   //Récupération des données objet
    foreach ($pageData->dataObjects as $drow) {
      if (($drow->dataType== 'http://purl.org/dc/dcmitype/Text') && ((isset( $drow->subject) && ( $drow->subject != 'http://rs.tdwg.org/ontology/voc/SPMInfoItems#ConservationStatus')))){
        $desc =  new ObjectText($this->_collectionid, $drow->identifier, $this->_pageid) ;
        $this->_textDesc =$desc;
      }
      elseif (($drow->dataType== 'http://purl.org/dc/dcmitype/StillImage') && ($this->_objectType !== 'Image')){
        $dir = constant('BASEPATH').constant('DATAPATH');
        $image =  new ObjectImage($this->_collectionid, $drow->identifier, $dir, '', $this->_pageid) ;
        $this->_image =$image;
      }
      elseif (($drow->dataType== 'http://purl.org/dc/dcmitype/Text') && ((isset( $drow->subject) && ( $drow->subject == 'http://rs.tdwg.org/ontology/voc/SPMInfoItems#ConservationStatus')))){
        $iucn =  new ObjectText($this->_collectionid, $drow->identifier, $this->_pageid) ;
        $this->_iucnStatus =$iucn;
      }
    }
  }
	
	function loadAndBuildHierarchyData () {

      $pagesWS = file_get_contents('http://eol.org/api/hierarchy_entries/1.0/'. $this->_taxonConceptId.'.json');
      print 'http://eol.org/api/hierarchy_entries/1.0/'. $this->_taxonConceptId.'.json'."\n";
      $pageData = json_decode($pagesWS);
      //Récupération de la hiérarhie des taxons
      $parentNameUsageID = $pageData->parentNameUsageID;
      $flatree = array();
      //Ajout de la racine
      $taxonData = (object) array(
        'sourceIdentifier' => $pageData->sourceIdentifier,
        'taxonID' =>  $pageData->taxonID,
        'parentNameUsageID' =>  $pageData->parentNameUsageID,
        'taxonConceptID' =>  $pageData->taxonConceptID,
        'scientificName' =>  $pageData->scientificName,
        'taxonRank' =>  $pageData->taxonRank,
        'type' =>  'leaf',
      );
      $flatree[0] = $taxonData ;
      $this->buildFlatHierarchy($flatree, $parentNameUsageID,$pageData->ancestors);
	}
	
	private function buildFlatHierarchy($flatree = array(), $parentNameUsageID,$data, $level=0) {
		//print $level.'           '.$parentNameUsageID."\n";
		//print_r($flatree);
		foreach($data as $id => $hieritem) {
			if ($hieritem->taxonID == $parentNameUsageID) {
					$ancestor = $hieritem->parentNameUsageID;
					$taxonConceptId = $hieritem->taxonConceptID;
					unset($data[$id]);
					$level ++;
          $hieritem->type =  'node';
					$flatree[$level] =  $hieritem;
					if ($ancestor != 0) {
						$this->buildflathierarchy($flatree, $ancestor, $data, $level);
					}
			}
		}
		if ((isset($ancestor)) && ($ancestor == 0)) {		
			$this->_flathierarchy= $flatree;
		}
	}
	
  public function getPreferedCommonName($lg= 'en') {
    foreach ($this->_commonNames as $key => $common)  {
      if (($common->language == $lg) && ($common->eol_preferred == 1)) {
          return $common;
      }
    }
    return false;
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
  public function getCommonNames() {
    return $this->_commonNames;
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
  public function setCommonNames($val) {
    $this->_commonNames=$val;
  }
  public function setIucnStatus($val) {
    $this->_iucnStatus = $val;
  }

}
