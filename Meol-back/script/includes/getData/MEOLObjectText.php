<?php

require_once('MEOLObject.php');


class ObjectText  extends ObjectData {

	
	public function __construct($collectionId, $objectId, $taxonID, $type ='taxon') {
    //Lancement du WS
    $objectWS = file_get_contents('http://eol.org/api/data_objects/1.0/'.$objectId.'.json');
    //print "\n".'http://eol.org/api/data_objects/1.0/'.$objectId.'.json'."\n";
    $reponseData = json_decode($objectWS);
    $objectData = $reponseData->dataObjects[0];
    
    parent::setUtils(new Utils());
    parent::setObjectId($objectId);
    parent::setCollectionId($collectionId);
    //Get metadata
    parent::extractObjectMetadata($objectData);
    //Get description
    parent::extractObjectDescription($objectData->description);
    //Get credit + licence
    parent::extractObjectPrivilege($objectData);
    $this->save2BD($taxonID, $type);
  }
  
  public function save2BD($taxonID, $type){
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);

     // on envoie la requête
    //Insertion en base de la collection
    $sql = 'INSERT INTO `Object_text` (`objectid`, `identifier`,`objectVersionID`,  `title`, `licence`, `rights`, `credit`, `description`, taxonid, type, fk_collection) VALUES (';
    $sql .= "'".parent::getObjectId()."',"."'".parent::getIdentifier()."',"."'".parent::getDataObjectVersionID()."',"."'".mysql_real_escape_string(parent::getTitle(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getLicence(), $db )."',"."'".mysql_real_escape_string(parent::getRights(), $db )."',";
    $sql .= "'".mysql_real_escape_string(parent::getCredits(), $db )."',"."'".mysql_real_escape_string(parent::getDescription(), $db )."',";
    $sql .= "".$taxonID.","."'".$type."', ".parent::getCollectionId().")";
    //$this->_utils->sendQuery($sql);
    $req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    mysql_close();
  }
  
  
}
