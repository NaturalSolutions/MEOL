<?php

require_once('UtilsInput.php');
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
	
	private $_utils;
	private $_preferedRef = 'Species 2000 & ITIS Catalogue of Life: May 2012';
	
	public function __construct($pageid, $collectionId, $flathierachy=0) {
    $this->_utils = new Utils();
    $this->_collectionid = $collectionId;
    $this->setPageid($pageid);
    $this->loadAndExtractTaxonData($flathierachy);
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
    
    //Récupération des données objet
    foreach ($pageData->dataObjects as $drow) {
      if (($drow->dataType== 'http://purl.org/dc/dcmitype/Text') && ((isset( $drow->subject) && ( $drow->subject != 'http://rs.tdwg.org/ontology/voc/SPMInfoItems#ConservationStatus')))){
        $desc =  new ObjectText($drow->identifier) ;
        $this->_textDesc =$desc;
      }
      elseif ($drow->dataType== 'http://purl.org/dc/dcmitype/StillImage') {
        $dir = constant('BASEPATH').constant('DATAPATH');
        $image =  new ObjectImage($drow->identifier, $dir) ;
        $this->_image =$image;
      }
      elseif (($drow->dataType== 'http://purl.org/dc/dcmitype/Text') && ((isset( $drow->subject) && ( $drow->subject == 'http://rs.tdwg.org/ontology/voc/SPMInfoItems#ConservationStatus')))){
        $iucn =  new ObjectText($drow->identifier) ;
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
