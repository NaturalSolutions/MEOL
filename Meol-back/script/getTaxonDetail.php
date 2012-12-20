<?php

$collec= array(
  'Eucalyptus','Gardenia jasminoides', 'Polianthes tuberosa', 'Jasminum','Anthoxanthum nitens', 
  'Cedrus', 'Citrus limon', 'Vanilla planifolia','Rosmarinus officinalis', 'Rosa rugosa'
);

//En fait il faut utiliser les données id page directement récupérable à partir du WS Collection
//$collec = array(29916,1102886,1081522,61788,1114447,34221,582200,1127948,579379,631307);
  
/******************************************
 ******************************************
 * Récupération des données
 *******************************************
 *******************************************/

$result = array();
foreach ($collec as $name) {
  $htmlname = str_replace(  ' ', '%20', $name);
  //Récupération des données de api eol
  //http://eol.org/api/search/1.0/Ursus?exact=1
  //$name = 'Eucalyptus';
  $response = file_get_contents('http://eol.org/api/search/1.0/'.$htmlname.'.json?exact=1');

  $response = json_decode($response);
  foreach ($response->results as $row) {
    //?test car je ne sais pas pourquoi exact ne marche pas mais de toute façon il faut utiliser directement le service page
    if ($row->title == $name) {
      $id = $row->id;
      $result[$id]['name'] = $name;
      $pres = file_get_contents('http://eol.org/api/pages/1.0/'. $id.'.json?common_names=0&details=0&images=1&subjects=all&text=1&iucn=1');
      $pres = json_decode($pres);
      foreach ($pres->dataObjects as $drow) {
        if ($drow->dataType== 'http://purl.org/dc/dcmitype/Text') {
          $desc = $drow->description;
          $desc = str_replace( "\n", '<br/>', $desc);
          $desc = str_replace( "\r", ' ', $desc);
          //Ajout de br tout les 91 caractères
          $cleandesc = addHtmlReturnLine($desc);
          $jsonDesc = json_encode($cleandesc, JSON_HEX_QUOT);
          $result[$id]['description'] = $jsonDesc;
        }
        elseif ($drow->dataType== 'http://purl.org/dc/dcmitype/StillImage') {
          $pictURL =  $drow->mediaURL;
          //Récupération de l'extension
          $splitURL =  explode ('.',$pictURL);
          $splitURL = array_reverse ( $splitURL);
          $ext = strtolower($splitURL[0]);
          $filename = str_replace(' ', '_', $name).'.'.$ext;
          curlSaveResources($pictURL, $filename);
          $result[$id]['picture'] =$name.'.'.$ext;
        }
      }
    }
  }
}
//Resize image with image magik
///for file in *; do convert $file -resize 100x66 thumbnail/$file; done


/******************************************
 ******************************************
 * Enregistrement dans un fichier
 *******************************************
 *******************************************/
$csv = 'id|name|description|image'."\n";
foreach ($result as $id=>$data) {
  $csv .= $id.'|"'.$data['name'].'"|'.$data['description'].'|"'.$data['picture'].'"'."\n";
}

$fp = fopen('data.csv', 'w');
fwrite($fp, $csv );
fclose($fp);



/******************************************
 ******************************************
 * Fonction qui permet d'ajouter un retour chariot (<br/>) tout les x caractères +/- aux espaces près
 *******************************************
 *******************************************/
function addHtmlReturnLine($str, $len = 91) {
  $finalString='';
  $segment=0;
  $wordStr =  explode (' ',$str);
  foreach($wordStr as $word) {
    $segment += strlen($word);
    $finalString.= $word.' ';
    if ($segment>$len) {
      $finalString.= '<br/>';
      $segment = 0;
    }
  }
  return $finalString;
}


/******************************************
 ******************************************
 * Fonction qui permet d'ajouter un retour chariot (<br/>) tout les x caractères +/- aux espaces près
 *******************************************
 *******************************************/
function curlSaveResources($url, $fileName) {
  print $url."\n";
  $ch = curl_init($url);
  $fp = fopen('images/'.$fileName, 'wb');
  curl_setopt($ch, CURLOPT_FILE, $fp);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_exec($ch);
  curl_close($ch);
  fclose($fp);
}
?>
