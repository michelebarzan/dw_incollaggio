<?php
	$dw_incollaggio_params_file = fopen("C:\dw_incollaggio_params.json", "r") or die("error");
	$dw_incollaggio_params=json_decode(fread($dw_incollaggio_params_file,filesize("C:\dw_incollaggio_params.json")), true);
	fclose($dw_incollaggio_params_file);

	$connectionInfo=array("Database"=>$database, "UID"=>$dw_incollaggio_params['sql_server_info']['username'], "PWD"=>$dw_incollaggio_params['sql_server_info']['password']);
	$conn = sqlsrv_connect($dw_incollaggio_params['sql_server_info']['ip'],$connectionInfo);
	if(!$conn)
		die("error");
?>