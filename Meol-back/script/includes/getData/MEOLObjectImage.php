<?php

require_once('MEOLObject.php');


class ObjectImage extends ObjectData {

  private $_mimeType; // (String)
  private $_fileName; // (String)
  private $_URL; // (String(URL))
  	
	public function __construct($collectionId, $objectId, $directory, $fileBaseName='', $taxonID, $type='taxon') {
    //Lancement du WS
    $objectWS = file_get_contents('http://eol.org/api/data_objects/1.0/'.$objectId.'.json');
    //print "\n".'http://eol.org/api/data_objects/1.0/'.$objectId.'.json'."\n";
    //print_r( $objectWS);
    $reponseData = json_decode($objectWS);
    $objectData = $reponseData->dataObjects[0];
    
    parent::setUtils(new Utils());
    parent::setObjectId($objectId);
    parent::setCollectionId($collectionId);
    //Get metadata
    parent::extractObjectMetadata($objectData);
    //Get Picture
    if ($fileBaseName == '') $fileBaseName = parent::getIdentifier();
    $this->extractObjectPicture($directory.'/images',$fileBaseName, $objectData);
    //Get credit + licence
    parent::extractObjectPrivilege($objectData);
    $this->save2BD($taxonID, $type);
  }
  
  public function extractObjectPicture($directory,$fileBaseName, $objectData) {
    $util = parent::getUtils();
    $this->_URL =  $objectData->eolMediaURL;
    //Récupération de l'extension
    if (isset($objectData->mimeType)) $this->_mimeType = $util->imageTypeToExtension($objectData->mimeType, false);
    else {
      print 'NO mime type,'.parent::getObjectId().',' .$this->_URL."\n";
      $splitURL =  explode ('.',$this->_URL);
      $splitURL = array_reverse ($splitURL);
      $this->_mimeType =strtolower($splitURL[0]);
    }
    $filename = str_replace(' ', '_',$fileBaseName).'.jpg';
    $util->curlSaveResources($this->_URL, $filename,$directory);
    $this->_fileName =$filename;
  }
  
  
   public function getFormatedObject() {
    $object =  parent::getFormatedObject() ;
    $object['mimeType'] = $this->_mimeType;
    $object['fileName'] = $this->_fileName;
    $object['URL'] = $this->_URL;
    return $object;
  }
  
   public function save2BD($taxonID, $type){
     
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);

     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Object_image` (`objectid`, `identifier`, `objectVersionID`, `title`, `licence`, `rights`, `credit`,  `photographer`, `description`, `mimeType`, `filename`, `URL`, `taxonId`, `type`, fk_collection) VALUES (';
    $sql .= "'".parent::getObjectId()."',"."'".parent::getIdentifier()."',"."'".parent::getDataObjectVersionID()."',"."'".mysql_real_escape_string(parent::getTitle(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getLicence(), $db )."',"."'".mysql_real_escape_string(parent::getRights(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getCredits(), $db )."',"."'".mysql_real_escape_string(parent::getPhotographer(), $db )."',"."'".mysql_real_escape_string(parent::getDescription(), $db )."',";
    $sql .= "'".mysql_real_escape_string($this->_mimeType, $db )."',"."'".mysql_real_escape_string($this->_fileName, $db )."',";
    $sql .= "'".mysql_real_escape_string($this->_URL, $db )."',";
    $sql .= "".$taxonID.","."'".$type."', ".parent::getCollectionId().")";
    //$this->_utils->sendQuery($sql);
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }
  
  
  /******************************************************
   ******************************************************
   *           ACCESSEURS
   ******************************************************
   ******************************************************/
  
  public function getMimeType() {
	 return $this->_mimeType;
  }
  public function getFileName() {
     return $this->_fileName;
  }
  public function getURL() {
     return $this->_URL;
  }
  public function setMimeType($val) {
    $this->_mimeType=$val;
  }
  public function setFileName($val) {
    $this->_fileName=$val;
  }
  public function setURL($val) {
    $this->_URL=$val;
  }

}
