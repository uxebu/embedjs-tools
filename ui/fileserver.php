<?php
class FileServer
{
	var $requests;
	
	var $data;
	
	function __construct(){
		$this->init();
		$this->execute();
		$this->send();
	}
	
	function init(){
		$this->requests = $_GET;
	}
	
	function execute(){
		switch($this->requests['cmd']){
			case 'getPlatforms':
				$this->data = $this->getPlatforms();
				break;
			case 'getFileInfo':
				$this->data = $this->getFileInfo();
				break;
			default:
				die();
		}
	}
	
	function send(){
		die(json_encode($this->data));
	}
	
	function getPlatforms(){
		$platforms = array();
		$path = dirname(__FILE__).'/'.$this->requests['pathToPlatforms'].'/';
		
    	$entries = scandir($path);
    	foreach($entries as $item)
    	{
    		if(is_file($path.$item))
    		{
    			$platforms[] = substr($item,0,-5);
    		}
    	}
    	
    	return $platforms;
	}
	
	function getFileInfo(){
		$files = explode(',', $this->requests['fileList']);
		$path = dirname(__FILE__).'/'.$this->requests['pathToSource'].'/';
		$info = array();
		foreach($files as $file){
			$info[$file] = $this->_getFileStats($path.$file);
		}
		return $info;
	}
	
	function _getFileStats($filename){
		$stats = stat($filename);
		return array(
			'lines' => count(file($filename)),
			'size' => $stats['size']
		);
	}
}

new FileServer();