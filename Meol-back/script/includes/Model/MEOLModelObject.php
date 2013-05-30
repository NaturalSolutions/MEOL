<?php


abstract class ModelObjectData {
  private $_objectId; //(integer)
  private $_identifier; //(String)
  private $_dataObjectVersionID; //(String)
  private $_title; //(String)
  private $_licence; // (String)
  private $_rights; // (String)
  private $_credits; // String ??
  private $_description;// (String)
  private $_pageId; // String ??
  private $_type;// (String)
  private $_photographer;// (String)


  public function getFormatedObject() {
    $object = array(
      'objectId'	=>$this->_objectId,
      'identifier'	=>$this->_identifier,
      'title'	=>$this->_title,
      'licence'	=>$this->_licence,
      'rights'	=>$this->_rights,
      'credits'	=>$this->_credits,
      'description'	=>$this->changeLinkIntoModalLink() ,//$this->_description,
    );
    return $object;
  }
  
  private function changeLinkIntoModalLink() {
    $desc= '';
    //<a class="ui-link" href="#" onclick="window.open('http://eol.org/pages/694','_blank','location=yes');" alt="more details on eol.org" target="_blank">Chordata</a>
    //Suppression des class et target
    $pattern = '/<a(.*)([target|class]=[\"\']([^\s\"\'])*[\"\']) (.*)>/';
    $replacement = "<a $1 $4>";
    $desc = preg_replace ( $pattern, $replacement , $this->_description);
     
    //Chagement de la forme du lien href=> to js function
    $pattern = '/href=[\"\']([^\s\"\']*)[\"\']/';
    $replacement = "class='ui-link' href='#' onclick=\"window.open('$1','_blank','location=yes');\" target='_blank'";
    $desc = preg_replace ( $pattern, $replacement , $desc);
    return $desc;
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
  public function getDataObjectVersionID() {
	 return $this->_dataObjectVersionID;
  }
  public function getPhotographer() {
	 return $this->_photographer;
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
  public function setDataObjectVersionID($val) {
	 $this->_dataObjectVersionID=$val;
  }
  public function setPhotographer($val) {
	 $this->_photographer = $val;
  }
}
