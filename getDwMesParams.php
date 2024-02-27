<?php
	$dw_mes_params_file = fopen("C:\dw_mes_params.json", "r") or die("error");
	echo fread($dw_mes_params_file,filesize("C:\dw_mes_params.json"));
	fclose($dw_mes_params_file);
?>