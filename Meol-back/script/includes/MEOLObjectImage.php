<?php

require_once('UtilsInput.php');
require_once('MEOLObject.php');


class ObjectImage extends ObjectData {

  private $_mimeType; // (String)
  private $_fileName; // (String)
  private $_URL; // (String(URL))
  	
	public function __construct($objectId, $directory, $fileBaseName='') {
    //Lancement du WS
    $objectWS = file_get_contents('http://eol.org/api/data_objects/1.0/'.$objectId.'.json');
    //print "\n".'http://eol.org/api/data_objects/1.0/'.$objectId.'.json'."\n";
    //print_r( $objectWS);
    $reponseData = json_decode($objectWS);
    $objectData = $reponseData->dataObjects[0];
    
    parent::setUtils(new Utils());
    parent::setObjectId($objectId);
    //Get metadata
    parent::extractObjectMetadata($objectData);
    //Get Picture
    if ($fileBaseName == '') $fileBaseName = parent::getIdentifier();
    $this->extractObjectPicture($directory.'/images',$fileBaseName, $objectData);
    //Get credit + licence
    parent::extractObjectPrivilege($objectData);
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
    $filename = str_replace(' ', '_',$fileBaseName).'.'.$this->_mimeType;
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
