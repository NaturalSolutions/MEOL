<?php



class iNatContinent {
  
  
  public function updateBD(){ 
    $db  = mysql_connect('localhost', 'root', '!sql2010');
    mysql_select_db('Meol-Data',$db);
    $sql = "SELECT DISTINCT pageid, taxonConceptId, substring_index(taxonName, ' ', 2) AS spName,  taxonName FROM Taxon WHERE terminal=1 AND iNat =''";
    // on envoie la requête
    $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());

    while ($row = mysql_fetch_assoc($result)) {
      $taxonName = $row ['spName'];
      //Récupération des données de la collection
      print 'http://www.inaturalist.org/places.json?place_type=continent&taxon='. $taxonName."\n";
      $iNatWS = file_get_contents('http://www.inaturalist.org/places.json?place_type=continent&taxon='. $taxonName);
      $iNatData = json_decode($iNatWS);
      print_r($iNatData);
      
      $occurence = '';
      foreach ($iNatData as $d) {
        $occurence .= $d->name.',';
      }
      $occurence = substr($occurence, 0, -1);
      $s = " UPDATE Taxon SET iNat = '". $occurence."' WHERE pageid =".$row ['pageid'];
      $r = mysql_query($s) or die('Erreur SQL !<br>'.$s.'<br>'.mysql_error());
    }
    mysql_close();
  }
}
