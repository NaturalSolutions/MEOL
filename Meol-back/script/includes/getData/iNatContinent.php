<?php



class iNatContinent {
  
  
  public function updateBD(){ 
    $db  = mysql_connect(constant('DB_SERVER'), constant('DB_USER'), constant('DB_PSW'));
    mysql_select_db( constant('DB_NAME'),$db);

    $sql = "SELECT DISTINCT pageid, taxonConceptId, substring_index(taxonName, ' ', 2) AS spName2, substring_index(taxonName, ' ', 3) AS spName3,  taxonName FROM Taxon WHERE terminal=1 AND iNat = ''";
    // on envoie la requête
    $result = mysql_query($sql) or die('Erreur SQL !<br>'.$sql.'<br>'.mysql_error());
    
    $taxonName ;
    while ($row = mysql_fetch_assoc($result)) {
      $taxonName3 = $row ['spName3'];
      $taxonName2 = $row ['spName2'];
      //Test si la troisième particule contient un caractère qui indiquerait une autorité
  
      $words = explode(' ',$taxonName3 );
      //print_r($words);
      if (count($words) < 3) $taxonName= $taxonName2; 
      else {
        $aut = preg_match("/([A-Z]|[\(\.,;])/",$words[2]);
        if ($aut > 0)  {
          $taxonName = $taxonName2;
        }
        else {
           $taxonName = $taxonName3;
            print  $taxonName."\n";
        }
      }
      
      //Récupération des données de la collection
      $iNatData =  $this->callInatApi($taxonName);

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
  
  private function callInatApi($taxonName) {
    print 'http://www.inaturalist.org/places.json?place_type=continent&establishment_means=native&taxon='. $taxonName."\n";
    $iNatWS = file_get_contents('http://www.inaturalist.org/places.json?place_type=continent&establishment_means=native&taxon='. $taxonName);
    $iNatData = json_decode($iNatWS);
    return $iNatData;
  }
}


