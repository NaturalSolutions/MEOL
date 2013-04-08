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
	private $_d3jsHierarchy;
  private $_collectionMetadata;
  private $_level;
  	
	private $_utils;


	public function __construct($collectionid) {
    $this->_utils = new Utils();
		$this->_taxons=array();
		$this->_items=array();
		$this->_nonTerminalTaxa=array();
		$this->_collectionid=$collectionid;
    
    //Récupération des données de la collection
    $collectionWS = file_get_contents('http://eol.org/api/collections/1.0/'.$collectionid.'.json');
    //print 'http://eol.org/api/collections/1.0/'.$collectionid.'.json'."\n";
    $collectionData = json_decode($collectionWS);
    
		$this->_collectionMetadata['name']=$collectionData->name;
		$this->_collectionMetadata['description']=$collectionData->description;
    $this->saveCollectionLogoFile($collectionData->logo_url);
    //Détermine si la collection est de type taxon ou photo
    $coltype = $this->determineCollectionType($collectionData->item_types);
    $this->buildCollectionItem($collectionData->collection_items);
    $hier = $this->buildUnifiedHierarchy();

    $this->save2BD($coltype);

  }
  
  private function save2BD($coltype){ 
    //Insertion en base de la collection
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);

    $sql = 'INSERT INTO `Meol-Data`.`Collection` (`id` ,`nom` ,`description` ,`logo` ,`type`, full_hierarchy) VALUES (';
    $sql .= $this->_collectionid .' , ';
    $sql .= "'". $this->_collectionMetadata['name'] ."','";
    $sql .= $this->_collectionMetadata['description']."','";
    $sql .=$this->_collectionMetadata['logo']."','" .$coltype."' , ";
    $sql .= "'".mysql_real_escape_string($this->_d3jsHierarchy, $db )."');";
    
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    
    mysql_close();
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
              $objectData = json_decode($objectWS);
              //Récupération de l'image
              //print 'http://eol.org/api/data_objects/1.0/'.$photoID.'.json'."\n";
              $dir = constant('BASEPATH').constant('DATAPATH');
              $image = new ObjectImage($this->_collectionid, $photoID, $dir,'', $photoID, 'item') ;
              $collectionItem['Image']= $image;
              //Récupération de l'identifiant du taxon
              $collectionItem['taxonID'] = $objectData->identifier;
            }
          }
          //print  $collectionItem['taxonID'];
          if ((isset($collectionItem['taxonID'])) && ($collectionItem['taxonID']>0)) {
            $collectionItem['taxon'] = new Taxon($collectionItem['taxonID'],$this->_collectionid);
            $this->_items[$collectionItem['taxonID']] = $collectionItem;
            
            //Insertion en base de la collection
            $sql = 'INSERT INTO `Meol-Data`.`Collection_Items` (`fk_collection`, `fk_taxon`, `object_id`, `fk_image`) VALUES (';
            $sql .= $this->_collectionid .' , '.$collectionItem['taxonID'].',';
            $sql .= $item->object_id.','. $item->object_id.')';
            $this->_utils->sendQuery($sql);
          }
        }
    }
  }
  
  public function formatTaxonDetailPanel() {
    $taxonDetail = array();
    //print "formatTaxonDetailPanel \n";
    foreach ($this->_items as $item) {
      $taxon = $item['taxon'];
      //Récupếration des objets;
      $desc = $taxon->getTextDesc();
      $img = $taxon->getImage();
      $iucn = $taxon->getIucnStatus();
      $flathier = $taxon->getFlathierarchy();
      if (isset($flathier)) $flathier = array_reverse($flathier);
      else $flathier = array();
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
        'flathierarchy' => $flathier,
        'preferredCommonNames' => $taxon->getPreferedCommonName(),
        //'commonNames' => $taxon->getCommonNames(),
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
        //'commonNames' => $taxon->getCommonNames(),
        'image' => $image,
        'iucnStatus' => $iucnStatus,
      );
    }
    //foreach($taxonDetail as $key => $val) print $key.'  -- '.$val['taxonName']."\n"; 
    return $taxonDetail;
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
          'child'=> $taxon->getPageid(),
				);	
			}	
		}
		$nbroot = 0;
    
		$root ;
		foreach($tabTax as $taxonConceptID =>$data) {
      if ($data['type'] != 'leaf') {
        $child = $this->_items[$data['child']];
        $hier =$child['taxon']->getFlathierarchy();
        //Traitement de la hiérarchie des taxons non terminaux
        $hier = array_reverse($hier);
        $taxHier = array();
        foreach($hier as $val) {
          if($val->taxonID == $taxonConceptID) {
            $taxHier[] = $val;
            break;
          }
          else $taxHier[] = $val;
        }
        $taxHier = array_reverse($taxHier);
        $taxon = new Taxon($data['taxonConceptID'], $this->_collectionid, $taxHier, constant('DEFAULT_REFERENTIAL'), 0);
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
			
		$unifiedHier = array();
    //S'il y a plus qu'une racine
    //=> ajout de la racine cellular organism : 11660866
    if ($nbroot > 1){
        $taxon = new Taxon(11660866, $this->_collectionid, array(), 'NCBI Taxonomy', 0);
        $this->_nonTerminalTaxa[11660866] = $taxon;
        $data =  array(
          'level' => -1,
          'taxonConceptID' => 11660866,
          'parentNameUsageID' => -10,
          'name' => 'Cellular organism',
          'type' => 'root',
          'child' => 0,
        );
        $data['type'] = 'root';
				$root['taxon']  = $data;
				$root['depth']  = -1;
				$root['id']  = 0;
    }
    $unifiedHier[$root['id']] = $root;
		$unifiedHier[$root['id']]['children'] = $this->_recursivUnifiedHierarchy($root['id'], $tabTax, 0);

		$d3jstree = $this->_formatUnifiedHierarchyForD3js($unifiedHier);
    $d3jstree =$d3jstree[0];

    $fulltree= (Object) $d3jstree;
    $this->_d3jsHierarchy = json_encode ($fulltree, JSON_HEX_QUOT);
    return $this->_d3jsHierarchy;
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
      print $key."-----------------".$fdata['name']."\n";
      $taxonID = $key;
      //Si c'est la racine artificielle
      if ($taxonID == 0 && $item['depth'] == -1 ) $taxonID = $this->_nonTerminalTaxa[11660866]->getTaxonConceptId();
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
          $fdata['vernacularName'] = $commonName->vernacularName;
          $fdata['name'] = $item['taxon']['name'];
        }
        $fdata['pageID'] = $taxonConceptID;
        $fdata['taxonConceptID'] = $taxonID;
      }
      //Sinon récupération des données suplémentaires
      if (isset($item['children'])) {
        $fdata['children'] = $this->_formatUnifiedHierarchyForD3js ($item['children']);
      }
      $ftree[] = $fdata;
    }
    return $ftree;
	}

  private function saveCollectionLogoFile($logoUrl) {

    $splitURL =  explode ('.',$logoUrl);
    $splitURL = array_reverse ($splitURL);
    $mimeType =strtolower($splitURL[0]);
  
    $filename = $this->_collectionid.'.'.$mimeType;
    $dir = constant('BASEPATH').constant('DATAPATH').'/images_collection';
    $this->_utils->curlSaveResources($logoUrl, $filename,$dir);
		$this->_collectionMetadata['logo']=$filename;
  }
  
  public function getCollectionMetadata() {
    return $this->_collectionMetadata;
  }
  
  public function getD3jsHierarchy() {
    return $this->_d3jsHierarchy;
  }
  
  public function getItems (){
    return  $_items;
    
  }
}

