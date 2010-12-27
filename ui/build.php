<?php

$params = array(
	'path', 'name', 'features', 'platforms', 'keepLines', 'stripConsole', 'uncompressed', 'verbose', 'customProfileName'
);

echo "<pre>Invoking script:\n";

$cmd = './build_from_web.sh';
foreach($params as $param){
	$cmd .= ' ' . escapeshellarg($_GET[$param]);
}

system($cmd);

$result = $status === 0 ? 'success' : 'failure';

echo "\nDone. You can close the Build Window now.";