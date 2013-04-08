<?php

require_once('MEOLModelObject.php');


class ModelObjectImage extends ModelObjectData {

  private $_mimeType; // (String)
  private $_fileName; // (String)
  private $_URL; // (String(URL))
    	
	public function __construct($objectId,$identifier,$title,$licence,$rights,$credits,$description,$pageId,$type='taxon', $mimeType, $fileName, $URL) {
    parent::setObjectId($objectId);
    parent::setIdentifier($identifier);
    parent::setTitle($title);
    parent::setLicence($licence);
    parent::setRights($rights);
    parent::setCredits($credits);
    parent::setDescription($description);
    parent::setPageId($pageId);
    parent::setType($type);
    $this->_mimeType =  $mimeType;
    $this->_fileName = $fileName;
    $this->_URL = $URL;
  }
  
   public function save2BD(){
     
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);
     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Object_image` (`objectid`, `identifier`, `title`, `licence`, `rights`, `credit`, `description`, `mimeType`, `filename`, `URL`, `taxonId`, `type`) VALUES (';
    $sql .= "'".parent::getObjectId()."',"."'".parent::getIdentifier()."',"."'".mysql_real_escape_string(parent::getTitle(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getLicence(), $db )."',"."'".mysql_real_escape_string(parent::getRights(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getCredits(), $db )."',"."'".mysql_real_escape_string(parent::getDescription(), $db )."',";
    $sql .= "'".mysql_real_escape_string($this->_mimeType, $db )."',"."'".mysql_real_escape_string($this->_fileName, $db )."',";
    $sql .= "'".mysql_real_escape_string($this->_URL, $db )."',";
    $sql .= "".parent::getPageId().","."'".parent::getType()."')";
    //$this->_utils->sendQuery($sql);
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
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
