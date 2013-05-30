<?php


/**
 * 
 * Script permettant de récupérer les données des collections de EOL
 * Via l'appel a des WS 
 * 
 * */
require_once('includes/getData/MEOLCollections.php');
require_once('includes/getData/MEOLCollection.php');
require_once('includes/getData/iNatContinent.php');

require_once('includes/UtilsInput.php');
require_once('includes/constants.php');


require_once('includes/Model/MEOLModelTaxon.php');
require_once('includes/Model/MEOLModelObjectText.php');
require_once('includes/Model/MEOLModelObjectImage.php');


/* 
 * TRUNCATE TABLE `Object_text`;
TRUNCATE TABLE `Object_image`;
TRUNCATE TABLE  Taxon;
TRUNCATE TABLE Collection_Items;
TRUNCATE TABLE Collection;
 * */

//Fichier de log
$flog = fopen(constant('LOGPATH').'log.txt', 'w');
$ferr = fopen(constant('LOGPATH').'error.txt', 'w');


//************************************************************************************
//Récupération de la liste des collections
//************************************************************************************
//Récupération des collections => Collection de collection
$idCol = 54043;
$collecCollection = new Collections($idCol);



//************************************************************************************
//Récupération des données pour chaque collection
//************************************************************************************

$collections =$collecCollection->getCollectionsList();

  

$collectionMetadata = array();
$taxonDetail = array();
$items = array();
$tcolId='';   

print constant('DB_SERVER').", ".constant('DB_USER').", ".constant('DB_PSW')."\n";

foreach ($collections  as $col) {
  $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
  mysql_select_db( constant('DB_NAME'),$db);
  
  //Test si la collection n'existe pas déjà en base
  $idCol = $col['id'];
  $levelCol = $col['level'];
  $sql = "SELECT count(*) AS count FROM Collection WHERE id = ". $idCol;
  // on envoie la requête
  $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

  while ($row = mysql_fetch_assoc($result)) {
    $count = $row['count'];
    if ($count  == 0 ) {
      $t = "\n************************************************************************************\n";
      $t .="COLLECTION : $idCol \n";
      
      print "\n************************************************************************************\n";
      print "COLLECTION : $idCol \n";
      fwrite($flog, $t);
      
      //Création de la collection
      $collec = new Collection($idCol, $levelCol );
    }
    else {
      print "\n******************************COLLECTION : $idCol ALREADY EXIST******************************************************\n";
    }
  }
  
  mysql_close();
}

//************************************************************************************
//Récupération des données de iNat
//************************************************************************************

$iNatAPI = new iNatContinent();
$iNatAPI->updateBD();

//************************************************************************************
//Mise à jour des données
//************************************************************************************
//Mise à jour du niveau des collections
/*
$db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
mysql_select_db( constant('DB_NAME'),$db);
$sql = 'UPDATE  `Collection` ';
$sql .='INNER JOIN ( ';
$sql .='SELECT COUNT(*) as count , fk_collection , ';
$sql .='CASE WHEN COUNT(*) <16 THEN 1   WHEN COUNT(*) >15 AND COUNT(*) <26  THEN 2  WHEN COUNT(*) >25 AND COUNT(*) <36  THEN 3  WHEN COUNT(*) >35 AND COUNT(*) <46  THEN 4  ELSE 5  END as levelnum ';
$sql .='FROM  Collection_Items GROUP BY fk_collection ';
$sql .=') nb ON fk_collection  =  `Collection`.id ';
$sql .='SET level = levelnum ';
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
*/
$db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
mysql_select_db( constant('DB_NAME'),$db);
  
//Mise à jour du nom commun
$sql = "UPDATE Taxon SET common_name = REPLACE(REPLACE(common_name_prefered, '{\"vernacularName\":\"', '') ,'\",\"language\":\"en\",\"eol_preferred\":true}', '') 
WHERE NOT common_name_prefered = 'false'";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

$sql = "UPDATE Taxon SET common_name=CONCAT(UCASE(SUBSTRING(common_name, 1, 1)),LCASE(SUBSTRING(common_name, 2)));";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());


//Mise à jour du poids IUCN
$sql = "UPDATE `Object_text` SET description = 'Least Concern (LC)' WHERE title = 'IUCNConservationStatus' AND description = 'Lower Risk/least concern (LR/lc)'";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

$sql = "UPDATE Taxon , `Object_text`  SET weightIUCN = 
CASE description
  WHEN 'Least Concern (LC)' THEN 3
  WHEN 'Near Threatened (NT)' THEN 5
  WHEN 'Vulnerable (VU)' THEN 8
  WHEN 'Endangered (EN)' THEN 13
  WHEN 'Critically Endangered (CR)' THEN 21
  WHEN 'Extinct (EX)' THEN 21
  Else 2
END
WHERE objectid =fk_iucn AND  title = 'IUCNConservationStatus'";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());


//Mise à jour du poids Contnient
$sql = "UPDATE Taxon SET weightContinent =  LENGTH(iNat) - LENGTH(REPLACE(iNat, ',', '')) +1 WHERE NOT iNat = ''";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

//Mise à jour ordre des collections
$sql = "UPDATE Collection SET ordre = 0";
$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());


mysql_close();

?> 
