<?php


require_once('MEOLTaxon.php');
require_once('MEOLObjectImage.php');

class Collection {
	private $_collectionid;
	private $_collectiontype;
	private $_itemnb;
	private $_items;
	private $_nonTerminalTaxa;
	private $_taxons;
	private $_unifiedHierarchy;
	
  
	public function __construct($collectionid) {
		$this->_taxons=array();
		$this->_items=array();
		$this->_nonTerminalTaxa=array();
		$this->_collectionid=$collectionid;
    //Récupération des données de la collection
    $collectionWS = file_get_contents('http://eol.org/api/collections/1.0/'.$collectionid.'.json');
    //print 'http://eol.org/api/collections/1.0/'.$collectionid.'.json'."\n";
    $collectionData = json_decode($collectionWS);
    //Détermine si la collection est de type taxon ou photo
    $coltype = $this->determineCollectionType($collectionData->item_types);
    $this->buildCollectionItem($collectionData->collection_items);

   // $this->setCollectionid($collectionid);
  }

  
  private function buildCollectionItem($items) {
    print "BUILD COLLECTION item $this->_collectionid \n";
    foreach($items as $item) {
        $collectionItem = array();
        if ($item->object_type == $this->_collectiontype) {
            print $item->title."\n";
          if ($item->object_type == 'TaxonConcept') {
            //Récupération de l'identifiant du taxon
            $collectionItem['taxonID'] = $item->object_id;
            $collectionItem['type'] = $item->object_type;
          }
          else {
            $collectionItem['type'] = $item->object_type;
            //récupération de l'identifiant de la photo
            $photoID = $item->object_id;
            if ((isset($photoID)) && ($photoID > 0)) {
              $objectWS = file_get_contents('http://eol.org/api/data_objects/1.0/'.$photoID.'.json');
              print 'http://eol.org/api/data_objects/1.0/'.$photoID.'.json'."\n";
              $objectData = json_decode($objectWS);
              //Récupération de l'image
              //print 'http://eol.org/api/data_objects/1.0/'.$photoID.'.json'."\n";
               $dir = constant('BASEPATH').constant('DATAPATH');
              $image = new ObjectImage($photoID, $dir.$this->_collectionid,'') ;
              $collectionItem['Image']= $image;
              //Récupération de l'identifiant du taxon
              $collectionItem['taxonID'] = $objectData->identifier;
            }
          }
          //print  $collectionItem['taxonID'];
          if ((isset($collectionItem['taxonID'])) && ($collectionItem['taxonID']>0)) {
            $collectionItem['taxon'] = new Taxon($collectionItem['taxonID'],$this->_collectionid);
            $this->_items[$collectionItem['taxonID']] = $collectionItem;
          }
        }
    }
  }
  
  public function formatTaxonDetailPanel() {
    print "formatTaxonDetailPanel $this->_collectionid \n";
    $taxonDetail = array();
    //print "formatTaxonDetailPanel \n";
    foreach ($this->_items as $item) {
      $taxon = $item['taxon'];
      //Récupếration des objets;
      $desc = $taxon->getTextDesc();
      $img = $taxon->getImage();
      $iucn = $taxon->getIucnStatus();
      $description ='';
      $image ='';
      $iucnStatus = '';
      if (isset($desc)) $description = $desc->getFormatedObject();
      if (isset($img)) $image = $img->getFormatedObject();
      if (isset($iucn)) $iucnStatus = $iucn->getFormatedObject();
      $taxonDetail[$taxon->getTaxonConceptId()] = array(
        'collectionid' => $taxon->getCollectionid(),
        'pageid' => $taxon->getPageid(),
        'taxonConceptId' => $taxon->getTaxonConceptId(),
        'taxonName' => $taxon->getTaxonName(),
        'textDesc' => $description,
        'flathierarchy' => $taxon->getFlathierarchy(),
        'preferredCommonNames' => $taxon->getPreferedCommonName(),
        'commonNames' => $taxon->getCommonNames(),
        'image' => $image,
        'iucnStatus' => $iucnStatus,
      );
    }
    foreach ($this->_nonTerminalTaxa as $key => $item) {
      $taxon = $item;
      $desc = $taxon->getTextDesc();
      $img = $taxon->getImage();
      $iucn = $taxon->getIucnStatus();
      $description ='';
      $image ='';
      $iucnStatus = '';
      if (isset($desc)) $description = $desc->getFormatedObject();
      if (isset($img)) $image = $img->getFormatedObject();
      if (isset($iucn)) $iucnStatus = $iucn->getFormatedObject();
      $taxonDetail[$taxon->getTaxonConceptId()] = array(
        'collectionid' => $taxon->getCollectionid(),
        'pageid' => $taxon->getPageid(),
        'taxonConceptId' => $taxon->getTaxonConceptId(),
        'taxonName' => $taxon->getTaxonName(),
        'textDesc' => $description,
        'flathierarchy' => $taxon->getFlathierarchy(),
        'preferredCommonNames' => $taxon->getPreferedCommonName(),
        'commonNames' => $taxon->getCommonNames(),
        'image' => $image,
        'iucnStatus' => $iucnStatus,
      );
    }
    $taxonDetailPanel= (Object) $taxonDetail;
    $taxonDetailPanelFormated = json_encode ($taxonDetailPanel, JSON_HEX_QUOT);
    return $taxonDetailPanelFormated;
  }
  
  private function determineCollectionType($itemTypes) {
    $coltype = 'other';
    foreach($itemTypes as $unitType) {
      if ($unitType->item_count>0 ) {
        if ($unitType->item_type=='Image') {
          $this->_itemnb =  $unitType->item_count;
          $coltype ='Image';
          $this->_collectiontype = $coltype;
          return $coltype; 
        }
        elseif ($unitType->item_type=='TaxonConcept')  {
          $this->_itemnb =  $unitType->item_count;
          $coltype = 'TaxonConcept';
        }
      }
    }
    $this->_collectiontype = $coltype;
    return $coltype; 
  }

	public function buildUnifiedHierarchy() {
		foreach ($this->_items as $item) {
      $taxon = $item['taxon'];
			$taxonhierarchy = $taxon->getFlathierarchy();
			foreach($taxonhierarchy as $level => $hieritem) {
				$tabTax[$hieritem->taxonID] = array(
					'level' => $level,
					'taxonConceptID' =>$hieritem->taxonConceptID,
					'parentNameUsageID' =>$hieritem->parentNameUsageID,
					'name' => $hieritem->scientificName,
					'type' => $hieritem->type,
				);	
			}	
		}
		$nbroot = 0;
      
		$root ;
		foreach($tabTax as $taxonConceptID =>$data) {
      if ($data['type'] != 'leaf') {
        //PATCH pour ne pas attendre 3 plombe l'erreur lancé par Rosa
        if ($data['taxonConceptID'] == 29911) break;
        $taxon = new Taxon($data['taxonConceptID'], $this->_collectionid);
        $this->_nonTerminalTaxa[$data['taxonConceptID']] = $taxon;
      }
			if ($data['parentNameUsageID'] == 0) {
				$nbroot ++;
        $data['type'] = 'root';
				$root['taxon']  = $data;
				$root['depth']  = 0;
				$root['id']  = $taxonConceptID;
			}
		}
		
		// S'il n'y a bien qu'une racine alors 
		$unifiedHier = array();
    if ($nbroot != 1){
        $data['type'] = 'root';
				$root['taxon']  = $data;
				$root['depth']  = 0;
				$root['id']  = 0;
    }
    $unifiedHier[$root['id']] = $root;
		$unifiedHier[$root['id']]['children'] = $this->_recursivUnifiedHierarchy($root['id'], $tabTax, 0);
		$d3jstree = $this->_formatUnifiedHierarchyForD3js($unifiedHier);
    $d3jstree =$d3jstree[0];
    $fulltree= (Object) $d3jstree;
    $jsond3jsftree = json_encode ($fulltree, JSON_HEX_QUOT);
    return $jsond3jsftree;
	}
	
	private function _recursivUnifiedHierarchy($parentNameUsageID, &$tabTax, $level) {
		$unifiedHier = array();
    $level++;
		foreach($tabTax as $taxonConceptID =>$data) {
			if ($parentNameUsageID ==$data['parentNameUsageID']) {
				$unifiedHier[$taxonConceptID]['taxon'] = $data;
        $unifiedHier[$taxonConceptID]['depth'] = $level;
        if ($data['level'] !=0 ) {
          $unifiedHier[$taxonConceptID]['children'] = $this->_recursivUnifiedHierarchy($taxonConceptID, $tabTax, $level);
        }
			}
		}
		return $unifiedHier;
	}
  
  private function _formatUnifiedHierarchyForD3js($unifiedHier) {
    
    foreach ( $unifiedHier as $key => $item ) {
      $fdata = array();
      $fdata['name'] = $item['taxon']['name'];
      $fdata['depth'] = $item['depth'];
      $taxonConceptID = $item['taxon']['taxonConceptID'];
      if($item['taxon']['type'] == 'leaf') {
        $fdata['terminal'] =true;
        //print_r($item);
        //Récupération des données du taxon => Nom vernaculaire + Text + Photos
        $tax = $this->_items[$taxonConceptID]['taxon'];
        if (isset($this->_items[$taxonConceptID]['Image'])) {
          $img =$this->_items[$taxonConceptID]['Image'];
        }
        else $img = $tax->getImage();
        
        if (isset($img)) $fdata['image'] =$img->getFileName();       
      }
      else {
        $tax = $this->_nonTerminalTaxa[$taxonConceptID];
      }
      if (isset($tax)) {
        $commonName = $tax->getPreferedCommonName();
        if ($commonName != false) {
          $fdata['name'] = $commonName->vernacularName.'<br/><i>'.$item['taxon']['name'].'</i>';
        }
        $fdata['taxonConceptID'] = $taxonConceptID;
      }
      //Sinon récupération des données suplémentaires
      if (isset($item['children'])) {
        $fdata['children'] = $this->_formatUnifiedHierarchyForD3js ($item['children']);
      }
      $ftree[] = $fdata;
    }
    return $ftree;
	}

  
}

