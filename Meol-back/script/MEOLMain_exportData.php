<?php

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
    
foreach ($collections  as $col) {
  $idCol = $col['id'];
  //Récupération des données de la collection
  //Test si la collection n'existe pas déjà en base
  $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
  mysql_select_db( constant('DB_NAME'),$db);
  $sql = 'SELECT  id, `nom` , `description` , `logo` , `type` , `full_hierarchy` , `level` , `ordre` FROM `Collection` WHERE  id = '. $idCol;
  $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

  while ($row = mysql_fetch_assoc($result)) {
    $collectionMetadata[$idCol] = array();
    $collectionMetadata[$idCol]['name']=$row['nom'];
    $collectionMetadata[$idCol]['description'] =$row['description'];
    $collectionMetadata[$idCol]['logo'] =$row['logo'];
    $collectionMetadata[$idCol]['level'] =$row['level'];
    $collectionMetadata[$idCol]['ordre'] =$row['ordre'];
    $collectionMetadata[$idCol]['active'] ='false';
  
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

  $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
  mysql_select_db( constant('DB_NAME'),$db);
  $sql = "SELECT * 
          FROM (
            SELECT `Collection_Items`.fk_collection, `Collection_Items`.object_id, `Taxon`.pageid, 'taxon' AS type, `Taxon`.taxonConceptId,  `Taxon`.taxonName, common_name, iNat, title, filename, weightIUCN,weightContinent
            FROM `Collection_Items`
            JOIN Taxon 
            ON pageid = `fk_taxon`
            JOIN Object_image ON Taxon.fk_image = objectid
            WHERE `fk_taxon` = `Collection_Items`.`fk_image`
            UNION
            SELECT `Collection_Items`.fk_collection,  `Collection_Items`.object_id,`Taxon`.pageid, 'Image' AS type,  `Taxon`.taxonConceptId, `Taxon`.taxonName, common_name, iNat, title, filename, weightIUCN, weightContinent
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



//Création du fichier items
print "\n************************************************************************************\n";
print "formatItems: $idCol \n";
$items= (Object) $items;
$items = json_encode ($items, JSON_HEX_QUOT);
$fp = fopen(constant('BASEPATH').constant('DATAPATH').'/items.json', 'w');
fwrite($fp, print_r($items, true));
fclose($fp);
print "END collection items: $idCol \n";


//Création du fichier collection metadata
print "\n************************************************************************************\n";
print "Collection metadata: $idCol \n";
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

$db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
mysql_select_db( constant('DB_NAME'),$db);
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
        $row['taxonId'],$row['type'],$row['objectVersionID']);
    }
  }
  else $textDesc = null;
  //Récupération de l'objet image du taxon
  $fk_image = $rowTaxon['fk_image'];
  if ($fk_image  !== '') {
    $sql = "SELECT *  FROM `Object_image` WHERE objectid = '".$fk_image ."'" ;
    $res = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    while ($row = mysql_fetch_assoc($res)) {
      $credit = $row['photographer'];
      if ($row['credit'] !== '') {
        $credit = "&copy; ".$row['credit'];
      }
      $credit =$credit . '  <a class="ui-link" href="#" onclick="window.open(\'http://eol.org/data_objects/'.$row['objectVersionID'].'\',\'_blank\',\'location=yes\');" alt="more details on eol.org" target="_blank"><img src ="css/images/icon_external-link.png"/></a>' ;
      $image = new ModelObjectImage($row['objectid'],$row['identifier'],$row['title'],$row['licence'],$row['rights'],$credit ,$row['description'],
        $row['taxonId'],$row['type'],$row['mimeType'],$row['filename'],$row['URL'], $row['objectVersionID'], $row['photographer']);
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
        $row['taxonId'],$row['type'],$row['objectVersionID']);
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
$cmd =  'mogrify -path '.constant('BASEPATH').constant('DATAPATH').'images_taxon/ -resize 400x300 -background transparent -gravity Center -extent 400x300 '.constant('BASEPATH').constant('DATAPATH').'images/*';
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
