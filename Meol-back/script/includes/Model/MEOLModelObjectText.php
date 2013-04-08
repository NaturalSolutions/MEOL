<?php

require_once('MEOLModelObject.php');


class ModelObjectText  extends ModelObjectData {

	
	public function __construct($objectId,$identifier,$title,$licence,$rights,$credits,$description,$pageId,$type='taxon') {
    parent::setObjectId($objectId);
    parent::setIdentifier($identifier);
    parent::setTitle($title);
    parent::setLicence($licence);
    parent::setRights($rights);
    parent::setCredits($credits);
    parent::setDescription($description);
    parent::setPageId($pageId);
    parent::setType($type);

  }
  
  public function save2BD($taxonID, $type){    
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);
     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Object_text` (`objectid`, `identifier`, `title`, `licence`, `rights`, `credit`, `description`, taxonid, type) VALUES (';
    $sql .= "'".parent::getObjectId()."',"."'".parent::getIdentifier()."',"."'".mysql_real_escape_string(parent::getTitle(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getLicence(), $db )."',"."'".mysql_real_escape_string(parent::getRights(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getCredits(), $db )."',"."'".mysql_real_escape_string(parent::getDescription(), $db )."',";
    $sql .= "".parent::getPageId().","."'".parent::getType()."')";
    //$this->_utils->sendQuery($sql);
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }
  
  
}
