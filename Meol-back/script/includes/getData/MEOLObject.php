<?php

abstract class ObjectData {
  private $_collectionId; //(integer)
  private $_objectId; //(integer)
  private $_identifier; //(String)
  private $_title; //(String)
  private $_licence; // (String)
  private $_rights; // (String)
  private $_credits; // String ??
  private $_description;// (String)
  private $_utils;

  public function extractObjectMetadata($objectData) {
    $this->_identifier = $objectData->identifier;
    if (isset($objectData->title)) $this->_title = $objectData->title;
    else $this->_title = $this->_identifier;
  }
  
  public function extractObjectDescription($description) {
    $desc = $description;
    $desc = str_replace( "\n", '<br/>', $desc);
    $desc = str_replace( "\r", ' ', $desc);
    $desc = str_replace( "\t", '', $desc);
    //Ajout de br tout les 91 caractères
    $cleandesc = $desc;
    //$cleandesc = $this->_utils->addHtmlReturnLine($desc, 91);
    //$jsonDesc = json_encode($cleandesc, JSON_HEX_QUOT);
    $this->_description = $cleandesc; 
  }
  
  public function extractObjectPrivilege($objectData) {

    if (isset($objectData->license))  $this->_licence = $objectData->license;
    if (isset($objectData->rights))  $this->_rights = $objectData->rights;
    $rightsHolder ='';
    if (isset($objectData->rightsHolder))  $rightsHolder = $objectData->rightsHolder;
    foreach ($objectData->agents as $agent){
      // get attribution details
      if ( $agent->role == 'photographer' ) {
        $photographer = $agent->full_name;
         if ( strrpos($agent->homepage , "http") > -1 )  $photographerLink = $agent->homepage;
      }
    }
    if ((isset($photographer)) &&($rightsHolder == $photographer )) { $rightsHolder = ''; } // eliminate duplicate
    // insert link if available
    if ( isset($photographer) && isset($photographerLink) ) { $photographer = "<a href='" . $photographerLink . "'>$photographer</a>"; }
    // insert appropriate copyright symbol
    if ( isset($rightsHolder) ) { $rightsHolder = "&copy; " . $rightsHolder; }
    // attribute copyright to the photographer if no other rights holder specified
    if ( isset($photographer) && !isset($rightsHolder)) { $photographer = "&copy; " . $photographer; }
    if ( !isset($photographer)) $photographer='';
    
    $this->_credits = $photographer.''.$rightsHolder ;
  }


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
  public function getCollectionId() {
	 return $this->_collectionId;
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
  public function setUtils(Utils $val) {
	 $this->_utils = $val;
  }
  public function setCollectionId($val) {
	 $this->_collectionId=$val;
  }
  
}
