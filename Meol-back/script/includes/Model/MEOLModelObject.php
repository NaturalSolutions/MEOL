<?php


abstract class ModelObjectData {
  private $_objectId; //(integer)
  private $_identifier; //(String)
  private $_title; //(String)
  private $_licence; // (String)
  private $_rights; // (String)
  private $_credits; // String ??
  private $_description;// (String)
  private $_pageId; // String ??
  private $_type;// (String)


  public function getFormatedObject() {
    $object = array(
      'objectId'	=>$this->_objectId,
      'identifier'	=>$this->_identifier,
      'title'	=>$this->_title,
      'licence'	=>$this->_licence,
      'rights'	=>$this->_rights,
      'credits'	=>$this->_credits,
      'description'	=>$this->_description,
    );
    return $object;
  }
  
  /******************************************************
   ******************************************************
   *           ACCESSEURS
   ******************************************************
   ******************************************************/
  public function getObjectId (){
    return $this->_objectId;
  }
  public function getIdentifier (){
    return $this->_identifier;
  }  
  public function getTitle (){
    return $this->_title;
  }  
  public function getLicence (){
    return $this->_licence;
  }  
  public function getRights (){
    return $this->_rights;
  }
  public function getCredits (){
    return $this->_credits;
  }
  public function getDescription() {
	 return $this->_description;
  }
  public function getUtils() {
	 return $this->_utils;
  }
  public function getPageId() {
	 return $this->_pageId;
  }
  public function getType() {
	 return $this->_type;
  }
    
  public function setObjectId ($val){
    $this->_objectId = $val;
  }
  public function setIdentifier ($val){
    $this->_identifier= $val;
  }  
  public function setTitle ($val){
    $this->_title= $val;
  }  
  public function setLicence ($val){
    $this->_licence= $val;
  }  
  public function setRights ($val){
    $this->_rights= $val;
  }
  public function setCredits ($val){
    $this->_credits= $val;
  }
  public function setDescription($val) {
	 $this->_description = $val;
  }
  public function setPageId($val) {
	 $this->_pageId=$val;
  }
  public function setType($val) {
	 $this->_type=$val;
  }
}
