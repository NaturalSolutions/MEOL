<?php

require_once('UtilsInput.php');
require_once('MEOLObject.php');


class ObjectText  extends ObjectData {

	
	public function __construct($objectId, $objectData) {
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
