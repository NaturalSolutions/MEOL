<?php


class Collections {
	private $_collectionid;
	private $_collectionsList;
	private $_utils;

	public function __construct($collectionid) {
    $this->_utils = new Utils();
		$this->_collectionsList=array();
    $this->_collectionid = $collectionid;
    //Récupération des données de la collection
    $collectionsWS = file_get_contents('http://eol.org/api/collections/1.0/'.$collectionid.'.json');
    //print 'http://eol.org/api/collections/1.0/'.$collectionid.'.json'."\n";
    $collectionsData = json_decode($collectionsWS);    
    $this->buildCollectionItem($collectionsData->collection_items);
  }
  
  private function buildCollectionItem($items) {
    print "BUILD COLLECTION List $this->_collectionid \n";
    foreach($items as $item) {
      $level = $item->annotation;
      $level = str_replace('Level:', '', $level);
      //Si pas de niveau spécifié => valeur par défault
      if ($level === '' ) {
        $level = constant('DEFAULT_LEVEL');
      }
      $this->_collectionsList[] = array('id' => $item->object_id, 'level' => $level);
    }
  }
  
  public function getCollectionsList (){
    return  $this->_collectionsList;
  }
}

