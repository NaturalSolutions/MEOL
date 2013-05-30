<?php

require_once('MEOLModelObject.php');


class ModelObjectText  extends ModelObjectData {

	
	public function __construct($objectId,$identifier,$title,$licence,$rights,$credits,$description,$pageId,$type='taxon',  $dataObjectVersionId) {
    parent::setObjectId($objectId);
    parent::setIdentifier($identifier);
    parent::setTitle($title);
    parent::setLicence($licence);
    parent::setRights($rights);
    parent::setCredits($credits);
    parent::setDescription($description);
    parent::setPageId($pageId);
    parent::setType($type);
    parent::setDataObjectVersionID( $dataObjectVersionId);
  }
  
  
}
