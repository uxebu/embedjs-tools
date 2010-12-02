<?php
error_reporting(E_ALL);
$buildName = $_GET['name'];
$features = $_GET['features'];
$path = $_GET['path'];
$platforms = $_GET['platforms'];
$keepLines = $_GET['keepLines'];
$stripConsole = $_GET['stripConsole'];

$params = array(
	$path, $buildName, $features, $platforms, $keepLines, $stripConsole
);


echo '<pre>';

//echo "Name: $buildName \n";
//echo "ProfilesRaw: $profilesRaw \n";
//echo "Profiles: " . print_r($profiles, true) . " \n";
//echo "ProfilesFlat: $profilesFlat \n";
//echo "Path: $path \n";


echo "Invoking script:\n";

$cmd = './build_from_web.sh';
foreach($params as $param){
	$cmd .= ' ' . escapeshellarg($param);
}

//system('./build_from_web.sh ' . escapeshellarg($path) . ' ' . escapeshellarg($buildName) . ' ' . escapeshellarg($profilesFlat) . ' ' . escapeshellarg(), $status);
system($cmd);

$result = $status === 0 ? 'success' : 'failure';

echo "\nDone. You can close the Build Window now.";