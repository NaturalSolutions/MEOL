
<?php

require_once('includes/MEOLCollection.php');


define("BASEPATH", '/home/administrateur/Documents/M-eol/sources/git/MEOL/Meol-back/');
define("DATAPATH", 'Data/');
define("ARCHIVEPATH", 'Archives/');
define("LOGPATH", '/home/administrateur/Documents/M-eol/sources/git/MEOL/Meol-back/');

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
//$collections =array(12819,29654,29653,12228,29656,29642,29641,10770,12225,12097,28766,29658);
//Collection non encore traitée
//$collections =array(6550,12227,12019,21,23141,30378,12777,24556,26517,13207,26702,29787,11578,26516,26724,9312,7251,9128,10328,10352,11031,10356,7197,11115,744);

$collections =array(12819);
foreach ($collections  as $idCol) {
  $t = "\n************************************************************************************\n";
  $t .="COLLECTION : $idCol \n";
  
  print "\n************************************************************************************\n";
  print "COLLECTION : $idCol \n";
  fwrite($flog, $t);
  
  $collec = new Collection($idCol);
  print "END COLLECTION : $idCol \n";
  
  //Création du fichier de hiérarchie
  print "\n************************************************************************************\n";
  print "buildUnifiedHierarchy: $idCol \n";
  $d3jstree = $collec->buildUnifiedHierarchy();
  $fp = fopen(constant('BASEPATH').constant('DATAPATH').$idCol.'/hierarchy.json', 'w');
  fwrite($fp, print_r($d3jstree, true));
  fclose($fp);
  print "END buildUnifiedHierarchy: $idCol \n";
  
  
  //Création du fichier détail taxon
  print "\n************************************************************************************\n";
  print "formatTaxonDetailPanel: $idCol \n";
  $taxonDetail = $collec->formatTaxonDetailPanel();
  $fp = fopen(constant('BASEPATH').constant('DATAPATH').$idCol.'/detail_Taxon.json', 'w');
  fwrite($fp, print_r($taxonDetail, true));
  fclose($fp);
  print "END formatTaxonDetailPanel: $idCol \n";

  //Traitement des images
  $err = 0;
  $run = exec('mogrify -resize 400x300 '.constant('BASEPATH').constant('DATAPATH').$idCol.'/images/*',$out,$err);
  fwrite($ferr, print_r($err."\n", true));
  fwrite($flog, print_r(implode ("\n",$out), true));
  
  //Création de l'archive de la collection
  $err = 0;
  $run = exec('zip -r '.constant('BASEPATH').constant('ARCHIVEPATH').$idCol.'.zip '.constant('BASEPATH').constant('DATAPATH').$idCol.'/',$out,$err);
  fwrite($ferr, print_r($err."\n", true));
  fwrite($flog, print_r(implode ("\n",$out), true));
  
}

fclose($ferr);
fclose($flog);


  
?> 
