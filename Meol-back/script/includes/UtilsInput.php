<?php

class Utils {
	public function __construct() {

  }
  
	/******************************************
	 ******************************************
	 * Fonction qui permet d'enregistrer un fichier
	 *******************************************
	 *******************************************/
	public function curlSaveResources($url, $fileName, $folder='images', $overide=false) {
    $foldUnit = explode('/',$folder);
    $fold='/';
    foreach ($foldUnit as $unit) {
      $fold.= $unit.'/';
      if(!is_dir($fold)) mkdir($fold);
    }
    //test si le fichier existe
    if ((!$overide) && (file_exists($folder.'/'.$fileName))) {
      return 2;
    }
    $fp = fopen($folder.'/'.$fileName, 'wb');
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_exec($ch);
		curl_close($ch);
		fclose($fp);
    return 1;
	}


	/******************************************
	 ******************************************
	 * Fonction qui permet d'ajouter un retour chariot (<br/>) tout les x caractères +/- aux espaces près
	 *******************************************
	 *******************************************/
	public function addHtmlReturnLine($str, $len = 91) {
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

  public static function imageTypeToExtension($imagetype, $includeDot = false) {
    $dot = $includeDot ? '.' : '';
    $ext = false;
     if(empty($imagetype)) return false;
     switch($imagetype) {
         case 'image/bmp': return $dot.'bmp';
         case 'image/cis-cod': return $dot.'cod';
         case 'image/gif': return $dot.'gif';
         case 'image/ief': return $dot.'ief';
         case 'image/jpeg':  return $dot.'jpg';
         case 'image/pipeg': return $dot.'jfif';
         case 'image/tiff': return $dot.'tif';
         case 'image/x-cmu-raster': return $dot.'ras';
         case 'image/x-cmx': return $dot.'cmx';
         case 'image/x-icon': return $dot.'ico';
         case 'image/x-portable-anymap': return $dot.'pnm';
         case 'image/x-portable-bitmap': return $dot.'pbm';
         case 'image/x-portable-graymap': return $dot.'pgm';
         case 'image/x-portable-pixmap': return $dot.'ppm';
         case 'image/x-rgb': return $dot.'rgb';
         case 'image/x-xbitmap': return $dot.'xbm';
         case 'image/x-xpixmap': return $dot.'xpm';
         case 'image/x-xwindowdump': return $dot.'xwd';
         case 'image/png': return $dot.'png';
         case 'image/x-jps': return $dot.'jps';
         case 'image/x-freehand': return $dot.'fh';
         default: return false;
     }
  }
}
