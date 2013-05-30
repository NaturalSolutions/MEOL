<?php

require_once('MEOLModelObject.php');


class ModelObjectImage extends ModelObjectData {

  private $_mimeType; // (String)
  private $_fileName; // (String)
  private $_URL; // (String(URL))
    	
	public function __construct($objectId,$identifier,$title,$licence,$rights,$credits,$description,$pageId,$type='taxon', $mimeType, $fileName, $URL, $photographer, $dataObjectVersionId) {
    parent::setObjectId($objectId);
    parent::setIdentifier($identifier);
    parent::setTitle($title);
    parent::setLicence($licence);
    parent::setRights($rights);
    parent::setCredits($credits);
    parent::setDescription($description);
    parent::setPageId($pageId);
    parent::setType($type);
    parent::setDataObjectVersionID($dataObjectVersionId);
    parent::setPhotographer($photographer);
    $this->_mimeType =  $mimeType;
    $this->_fileName = $fileName;
    $this->_URL = $URL;
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
