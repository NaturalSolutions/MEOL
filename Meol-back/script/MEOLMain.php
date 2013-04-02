<?php

require_once('includes/DAO/MEOLCollection.php');

require_once('includes/UtilsInput.php');

require_once('includes/Model/MEOLModelTaxon.php');
require_once('includes/Model/MEOLModelObjectText.php');
require_once('includes/Model/MEOLModelObjectImage.php');


/*
 * 
 * TRUNCATE TABLE `Object_text`;
TRUNCATE TABLE `Object_image`;
TRUNCATE TABLE  Taxon;
TRUNCATE TABLE Collection_Items;
TRUNCATE TABLE Collection;
 * */
define("BASEPATH", '/home/administrateur/Documents/M-eol/Meol-back_2/');
define("DATAPATH", 'Data/');
define("ARCHIVEPATH", 'Archives/');
define("LOGPATH", '/home/administrateur/Documents/M-eol/Meol-back_2/');

define("DEFAULT_REFERENTIAL", 'Species 2000 & ITIS Catalogue of Life: May 2012');

//Fichier de log
$flog = fopen(constant('LOGPATH').'log.txt', 'w');
$ferr = fopen(constant('LOGPATH').'error.txt', 'w');

//Toutes les collections 
$collections =array(
  12819,29654,29653,12228,29656,29642,29641,10770,12225,12097,
  28766,29658,6550,12227,12019,21,23141,30378,12777,24556,
  26517,13207,26702,29787,11578,26516,26724,9312,7251,9128,
  10328,10352,11031,10356,7197,11115,744
);
//Collections dont les photos ont déjà  été récupérées
$collections =array(29654,29653);//,12228,29656,29642,29641,10770,12225,12097,28766,29658);
//Collection non encore traitée
//$collections =array(6550,12227,12019,21,23141,30378,12777,24556,26517,13207,26702,29787,11578,26516,26724,9312,7251,9128,10328,10352,11031,10356,7197,11115,744);

$collections =array(12819, 29654, 13207,23141,12019, 6550);
//$collections =array(10328,10352,11031,10356,7197,11115,744);
//51167 collection de tests
//$collections =array(51168);
$collectionMetadata = array();
$taxonDetail = array();
$items = array();

$tcolId='';   
    
foreach ($collections  as $idCol) {
  
  //Test si la collection n'existe pas déjà en base
  $db  = mysql_connect('localhost', 'root', '!sql2010');
  mysql_select_db('Meol-Data',$db);
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
      $collec = new Collection($idCol);
    }
  }
  mysql_close();
  
  //Récupération des données de la collection
  //Test si la collection n'existe pas déjà en base
  $db  = mysql_connect('localhost', 'root', '!sql2010');
  mysql_select_db('Meol-Data',$db);
  $sql = 'SELECT  id, `nom` , `description` , `logo` , `type` , `full_hierarchy` , level FROM `Collection` WHERE  id = '. $idCol;
  $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

  while ($row = mysql_fetch_assoc($result)) {
    $collectionMetadata[$idCol] = array();
    $collectionMetadata[$idCol]['name']=$row['nom'];
    $collectionMetadata[$idCol]['description'] =$row['description'];
    $collectionMetadata[$idCol]['logo'] =$row['logo'];
    $collectionMetadata[$idCol]['level'] =$row['level'];
  
    //Création du fichier de hiérarchie
    print "\n************************************************************************************\n";
    print "buildUnifiedHierarchy: $idCol \n";
    $d3jstree = $row['full_hierarchy'];
    $fp = fopen(constant('BASEPATH').constant('DATAPATH').'/hierarchies/'.$idCol.'.json', 'w');
    fwrite($fp, print_r($d3jstree, true));
    fclose($fp);
    print "END buildUnifiedHierarchy: $idCol \n";
    
  }

  //Récupération des items taxons
    //Récupération des données de la collection
  //Test si la collection n'existe pas déjà en base
  $db  = mysql_connect('localhost', 'root', '!sql2010');
  mysql_select_db('Meol-Data',$db);
  $sql = "SELECT * 
          FROM (
            SELECT `Collection_Items`.fk_collection, `Collection_Items`.object_id, `Taxon`.pageid, 'taxon' AS type, `Taxon`.taxonConceptId,  `Taxon`.taxonName, common_name, iNat, title, filename
            FROM `Collection_Items`
            JOIN Taxon 
            ON pageid = `fk_taxon`
            JOIN Object_image ON Taxon.fk_image = objectid
            WHERE `fk_taxon` = `Collection_Items`.`fk_image`
            UNION
            SELECT `Collection_Items`.fk_collection,  `Collection_Items`.object_id,`Taxon`.pageid, 'Image' AS type,  `Taxon`.taxonConceptId, `Taxon`.taxonName, common_name, iNat, title, filename
            FROM `Collection_Items`
            JOIN Taxon 
            ON pageid = `fk_taxon` AND `Collection_Items`.fk_collection = Taxon.fk_collection
            JOIN Object_image ON `Collection_Items`.fk_image = taxonId AND `Collection_Items`.fk_collection = Object_image.fk_collection
            WHERE  NOT `fk_taxon` = `Collection_Items`.`fk_image`
          ) items
          WHERE fk_collection = ". $idCol;
  $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

  while ($row = mysql_fetch_assoc($result)) {
    $id = $idCol.'-'.$row['object_id'];
    $items[$id] = $row;
    
  }
  //$taxonDetailCollec = $collec->formatTaxonDetailPanel();
  //$taxonDetail =$taxonDetail+$taxonDetailCollec;
  print "END COLLECTION : $idCol \n";
  mysql_close();
  $tcolId.=$idCol.',';   
}
$tcolId = substr($tcolId, 0, -1);


//Mise à jour du niveau des collections
$db  = mysql_connect('localhost', 'root', '!sql2010');
mysql_select_db('Meol-Data',$db);
$sql = 'UPDATE  `Collection` ';
$sql .='INNER JOIN ( ';
$sql .='SELECT COUNT(*) as count , fk_collection , ';
$sql .='CASE WHEN COUNT(*) <16 THEN 1   WHEN COUNT(*) >15 AND COUNT(*) <26  THEN 2  WHEN COUNT(*) >25 AND COUNT(*) <36  THEN 3  WHEN COUNT(*) >35 AND COUNT(*) <46  THEN 4  ELSE 5  END as levelnum ';
$sql .='FROM  Collection_Items GROUP BY fk_collection ';
$sql .=') nb ON fk_collection  =  `Collection`.id ';
$sql .='SET level = levelnum ';

$req = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
mysql_close();

//Création du fichier collection metadata
print "\n************************************************************************************\n";
print "Collection metadata: $idCol \n";
$items= (Object) $items;
$items = json_encode ($items, JSON_HEX_QUOT);
$fp = fopen(constant('BASEPATH').constant('DATAPATH').'/items.json', 'w');
fwrite($fp, print_r($items, true));
fclose($fp);
print "END collection items: $idCol \n";


//Création du fichier items
print "\n************************************************************************************\n";
print "formatItems: $idCol \n";
$collectionMetadata= (Object) $collectionMetadata;
$collectionMetadata = json_encode ($collectionMetadata, JSON_HEX_QUOT);
$fp = fopen(constant('BASEPATH').constant('DATAPATH').'/collection_metadata.json', 'w');
fwrite($fp, print_r($collectionMetadata, true));
fclose($fp);
print "END ollection metadata: $idCol \n";

//Création du fichier détail taxon
print "\n************************************************************************************\n";
print "formatTaxonDetailPanel: $idCol \n";
//Récupération des données
/*SELECT `Taxon`.pageid, `Taxon`.taxonConceptId, `Taxon`.taxonName,`Taxon`.flathierarchy,`Taxon`.terminal,`Taxon`.common_name_prefered,
`Taxon`.common_name,`Taxon`.fk_text,`Taxon`.fk_image,`Taxon`.fk_iucn, GROUP_CONCAT(`Taxon`.fk_collection) AS fk_collection
FROM `Taxon`
GROUP BY   `Taxon`.pageid, `Taxon`.taxonConceptId,`Taxon`.taxonName,`Taxon`.flathierarchy,`Taxon`.terminal,`Taxon`.common_name_prefered,
`Taxon`.common_name,`Taxon`.fk_text,`Taxon`.fk_image,`Taxon`.fk_iucn
WHERE fk_collection IN ($tcolId );*/

$taxonDetail = array();

//Récupération des données d'intérets
$db  = mysql_connect('localhost', 'root', '!sql2010');
mysql_select_db('Meol-Data',$db);
$sqlTaxon = 'SELECT `Taxon`.pageid, `Taxon`.taxonConceptId, `Taxon`.taxonName,`Taxon`.flathierarchy,`Taxon`.terminal,`Taxon`.common_name_prefered,
  `Taxon`.common_name,`Taxon`.fk_text,`Taxon`.fk_image,`Taxon`.fk_iucn, GROUP_CONCAT(`Taxon`.fk_collection) AS fk_collection
  FROM `Taxon`
  WHERE fk_collection IN ('.$tcolId.' )
  GROUP BY   `Taxon`.pageid, `Taxon`.taxonConceptId,`Taxon`.taxonName,`Taxon`.flathierarchy,`Taxon`.terminal,`Taxon`.common_name_prefered,
  `Taxon`.common_name,`Taxon`.fk_text,`Taxon`.fk_image,`Taxon`.fk_iucn';
  
// on envoie la requête
$result = mysql_query($sqlTaxon) or die('Erreur SQL !<br>'.$sqlTaxon.'<br>'.mysql_error());

while ($rowTaxon = mysql_fetch_assoc($result)) {
  //Récupération des objets text de description
  $fk_text = $rowTaxon['fk_text'];
  if ($fk_text  !== '') {
    $sql = "SELECT *  FROM `Object_text` WHERE objectid = '".$fk_text."'" ;
    $res = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    while ($row = mysql_fetch_assoc($res)) {

      $textDesc = new ModelObjectText($row['objectid'],$row['identifier'],$row['title'],$row['licence'],$row['rights'],$row['credit'],$row['description'],
        $row['taxonId'],$row['type']);
    }
  }
  else $textDesc = null;
  //Récupération de l'objet image du taxon
  $fk_image = $rowTaxon['fk_image'];
  if ($fk_image  !== '') {
    $sql = "SELECT *  FROM `Object_image` WHERE objectid = '".$fk_image ."'" ;
    $res = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    while ($row = mysql_fetch_assoc($res)) {

      $image = new ModelObjectImage($row['objectid'],$row['identifier'],$row['title'],$row['licence'],$row['rights'],$row['credit'],$row['description'],
        $row['taxonId'],$row['type'],$row['mimeType'],$row['filename'],$row['URL']);
    }
  }
  else $image=null;
  //Récupération de l'objet statut uicn
  $fk_iucn = $rowTaxon['fk_iucn'];
  if ($fk_iucn  !== '') {
    $sql = "SELECT *  FROM `Object_text` WHERE objectid = '".$fk_iucn."'" ;
    $res = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    while ($row = mysql_fetch_assoc($res)) {
      $iucnStatus = new ModelObjectText($row['objectid'],$row['identifier'],$row['title'],$row['licence'],$row['rights'],$row['credit'],$row['description'],
        $row['taxonId'],$row['type']);
    }
  }
  else $iucnStatus = null;

  //Création de l'objet taxon
  $taxon = new ModelTaxon ($rowTaxon['fk_collection'], $rowTaxon['pageid'], $rowTaxon['taxonConceptId'], $rowTaxon['taxonName']
      ,$textDesc,$rowTaxon['flathierarchy'], $rowTaxon['common_name_prefered'],$image,$iucnStatus ,$rowTaxon['terminal']);
      
  $taxonDetail[$rowTaxon['taxonConceptId']]=  $taxon->formatTaxonDetailPanel2() ;
}
mysql_close();

//print_r($taxonDetail);

$taxonDetailPanel= (Object) $taxonDetail;
$taxonDetailPanelFormated = json_encode ($taxonDetailPanel,JSON_HEX_QUOT);
$fp = fopen(constant('BASEPATH').constant('DATAPATH').'/detail_Taxon.json', 'w');
fwrite($fp, print_r($taxonDetailPanelFormated, true));
fclose($fp);
print "END formatTaxonDetailPanel: $idCol \n";


//Traitement des images
$err = 0;
/*mogrify -path ./alter/ -format png init/*
mogrify -resize 400x300 -background transparent -gravity Center -extent 400x300 ./alter/*.png*/
//print 'mogrify -path '.constant('BASEPATH').constant('DATAPATH').'images_formated/ -format png '.constant('BASEPATH').constant('DATAPATH').'images/*';
//$run = exec('mogrify -path '.constant('BASEPATH').constant('DATAPATH').'images_formated/ -format png '.constant('BASEPATH').constant('DATAPATH').'images/*',$out,$err);

$cmd =  'mogrify -path '.constant('BASEPATH').constant('DATAPATH').'images_formated/ -resize 400x300 -background transparent -gravity Center -extent 400x300 '.constant('BASEPATH').constant('DATAPATH').'images/*';
print $cmd; 
$run = exec($cmd,$out,$err);
fwrite($ferr, print_r($err."\n", true));
fwrite($flog, print_r(implode ("\n",$out), true));


fclose($ferr);
fclose($flog);


//Création de l'archive de la collection
/*$err = 0;
chdir(constant('BASEPATH').constant('DATAPATH').$idCol);
$run = exec('zip -r '.constant('BASEPATH').constant('ARCHIVEPATH').$idCol.'.zip '.'*',$out,$err);
fwrite($ferr, print_r($err."\n", true));
fwrite($flog, print_r(implode ("\n",$out), true));
*/

?> 
