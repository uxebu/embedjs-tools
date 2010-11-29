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
}

new FileServer();