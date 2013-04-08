<?php


require_once('MEOLModelTaxon.php');
require_once('MEOLObjectImage.php');

class ModelCollection {
	private $_collectionid;
	private $_collectiontype;
	private $_itemnb;
	private $_items;
	private $_nonTerminalTaxa;
	private $_taxons;
	private $_unifiedHierarchy;
  private $_collectionMetadata;
  private $_coltype;
  private $_level;

	private $_utils;

  public function __construct($collectionid) {
    $this->_utils = new Utils();
    
		$this->_collectionid=$collectionid;
    
		$this->_taxons=array();
		$this->_items=array();
		$this->_nonTerminalTaxa=array();
  }
	public function __construct($collectionid,$collectiontype,$itemnb,$items,$nonTerminalTaxa,$taxons,$unifiedHierarchy,$collectionMetadata,$coltype ,$level) {
    $this->_utils = new Utils();
		$this->_collectionid=$collectionid;
    $this->_collectiontype=$collectiontype;
    $this->_itemnb = $itemnb;
    $this->_items=$items;
    $this->_taxons=$taxons;
    $this->_nonTerminalTaxa=$nonTerminalTaxa;
    $this->_unifiedHierarchy=$unifiedHierarchy;
    $this->_collectionMetadata=$collectionMetadata;
    $this->_coltype =$coltype  ;
  }
  
  public function save2BD($coltype){ 
    $hier = $this->buildUnifiedHierarchy();
    //Insertion en base de la collection
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);
    $sql = 'INSERT INTO `Meol-Data`.`Collection` (`id` ,`nom` ,`description` ,`logo` ,`type`, full_hierarchy) VALUES (';
    $sql .= $this->_collectionid .' , ';
    $sql .= "'". $this->_collectionMetadata['name'] ."','";
    $sql .= $this->_collectionMetadata['description']."','";
    $sql .=$this->_collectionMetadata['logo']."','" .$coltype."' , ";
    $sql .= "'".mysql_real_escape_string($hier, $db )."');";
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }
  
  
  public function getCollectionid(){
    return $this->_collectionid;
  }
  public function getCollectiontype(){
    return $this->_collectiontype;
  }
  public function getItemnb(){
    return $this->_itemnb;
  }
  public function getItems(){
    return $this->_items;
  }
  public function getNonTerminalTaxa(){
    return $this->_nonTerminalTax;
  }
  public function getTaxons(){
    return $this->_taxons;
  }
  public function getUnifiedHierarchy(){
    return $this->_unifiedHierarchy;
  }
  public function getCollectionMetadata(){
    return $this->_collectionMetadata;
  }
  public function getColtype(){
    return $this->_coltype;
  }
  public function getLevel(){
    return $this->level;
  }

  public function setLevel($val){
    $this->level= $val;
  }
  public function setCollectionid($val){
    $this->_collectionid= $val;
  }
  public function setCollectiontype($val){
    $this->_collectiontype= $val;
  }
  public function setItemnb($val){
    $this->_itemnb= $val;
  }
  public function setItems($val){
    $this->_items= $val;
  }
  public function setNonTerminalTaxa($val){
    $this->_nonTerminalTax= $val;
  }
  public function setTaxons($val){
    $this->_taxons= $val;
  }
  public function setUnifiedHierarchy($val){
    $this->_unifiedHierarchy= $val;
  }
  public function setCollectionMetadata($val){
    $this->_collectionMetadata= $val;
  }
}

