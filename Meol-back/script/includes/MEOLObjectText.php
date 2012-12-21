<?php

require_once('UtilsInput.php');
require_once('MEOLObject.php');


class ObjectText  extends ObjectData {

	
	public function __construct($objectId) {
    //Lancement du WS
    $objectWS = file_get_contents('http://eol.org/api/data_objects/1.0/'.$objectId.'.json');
    //print "\n".'http://eol.org/api/data_objects/1.0/'.$objectId.'.json'."\n";
    $reponseData = json_decode($objectWS);
    $objectData = $reponseData->dataObjects[0];
    
    parent::setUtils(new Utils());
    parent::setObjectId($objectId);
    //Get metadata
    parent::extractObjectMetadata($objectData);
    //Get description
    parent::extractObjectDescription($objectData->description);
    //Get credit + licence
    parent::extractObjectPrivilege($objectData);
  }
  
  
}
