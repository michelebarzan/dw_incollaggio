<?php

	// Load credentials from JSON
	$dw_incollaggio_params_file = fopen("C:\dw_incollaggio_params.json", "r") or die("error");
	$dw_incollaggio_params = json_decode(fread($dw_incollaggio_params_file, filesize("C:\dw_incollaggio_params.json")), true);
	fclose($dw_incollaggio_params_file);

	// Build connection array with extended login timeout
	$connectionInfo = array(
		"Database" => "dw_incollaggio",
		"UID" => $dw_incollaggio_params['sql_server_info']['username'],
		"PWD" => $dw_incollaggio_params['sql_server_info']['password'],
		"LoginTimeout" => 60, // default is 15; increase to 60 seconds
		"TrustServerCertificate" => true
	);

	// Establish connection
	$conn = sqlsrv_connect($dw_incollaggio_params['sql_server_info']['ip'], $connectionInfo);
	if(!$conn)
		die("error");

	set_time_limit(0);
    ini_set('memory_limit', '-1');

    $id_ordine_di_produzione=$_REQUEST["id_ordine_di_produzione"];
    $numero_cabina=$_REQUEST["numero_cabina"];
    $produzione_per_cabina=filter_var($_REQUEST["produzione_per_cabina"], FILTER_VALIDATE_BOOLEAN);

    $pannelli=[];

    /*if($produzione_per_cabina)
    {
        $query2="SELECT DISTINCT 
                    TOP (100) PERCENT dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, 
                    dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, dw_produzione.dbo.distinta_ordini_di_produzione.pannello, dw_produzione.dbo.filtro_pannelli.elettrificato, db_tecnico.dbo.pannelli.profilo, 
                    dw_produzione.dbo.filtro_pannelli.configurazione, db_tecnico.dbo.lamiere.ang, db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2, db_tecnico.dbo.lamiere.halt
                FROM dw_produzione.dbo.ordini_di_produzione INNER JOIN
                    dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                    db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                    dw_produzione.dbo.filtro_pannelli ON db_tecnico.dbo.pannelli.codice_pannello = dw_produzione.dbo.filtro_pannelli.CODPAS INNER JOIN
                    db_tecnico.dbo.lamiere ON db_tecnico.dbo.pannelli.id_lamiera = db_tecnico.dbo.lamiere.id_lamiera
                WHERE (dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = $id_ordine_di_produzione) AND (dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina = '$numero_cabina') AND 
                    (dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta NOT IN
                        (SELECT id_distinta
                        FROM dbo.pannelli_caricati)) AND (dw_produzione.dbo.distinta_ordini_di_produzione.stazione =
                             (SELECT        id_stazione
                               FROM            dw_produzione.dbo.stazioni
                               WHERE        (nome = 'assemblaggio_byrb')))
                ORDER BY db_tecnico.dbo.pannelli.codice_pannello";
    }
    else
    {*/
        $query2="SELECT DISTINCT 
                         TOP (100) PERCENT CASE WHEN id_lamiera_c IS NULL THEN CASE WHEN db_tecnico.dbo.pannelli.id_lamiera_r IS NULL THEN 'mf' ELSE 'bf' END ELSE 'carter' END AS configurazione, 
                         dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta, db_tecnico.dbo.pannelli.id_pannello, db_tecnico.dbo.pannelli.codice_pannello, dw_produzione.dbo.distinta_ordini_di_produzione.numero_cabina, 
                         dw_produzione.dbo.distinta_ordini_di_produzione.pannello, CASE WHEN check_elettrificato.id_pannello IS NULL THEN 'false' ELSE 'true' END AS elettrificato, db_tecnico.dbo.pannelli.profilo, db_tecnico.dbo.lamiere.ang, 
                         db_tecnico.dbo.lamiere.lung1, db_tecnico.dbo.lamiere.lung2, db_tecnico.dbo.lamiere.halt
FROM            dw_produzione.dbo.ordini_di_produzione INNER JOIN
                         dw_produzione.dbo.distinta_ordini_di_produzione ON dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = dw_produzione.dbo.distinta_ordini_di_produzione.ordine_di_produzione INNER JOIN
                         db_tecnico.dbo.pannelli ON dw_produzione.dbo.distinta_ordini_di_produzione.pannello = db_tecnico.dbo.pannelli.id_pannello INNER JOIN
                         db_tecnico.dbo.lamiere ON db_tecnico.dbo.pannelli.id_lamiera = db_tecnico.dbo.lamiere.id_lamiera LEFT OUTER JOIN
                         db_tecnico.dbo.lamiere_r ON db_tecnico.dbo.pannelli.id_lamiera_r = db_tecnico.dbo.lamiere_r.id_lamiera_r LEFT OUTER JOIN
                         db_tecnico.dbo.lamiere_r AS lamiere_r_1 ON db_tecnico.dbo.pannelli.id_lamiera_c = lamiere_r_1.id_lamiera_r LEFT OUTER JOIN
                             (SELECT DISTINCT pannelli_1.id_pannello
                               FROM            db_tecnico.dbo.materie_prime_pannelli INNER JOIN
                                                         db_tecnico.dbo.pannelli AS pannelli_1 ON db_tecnico.dbo.materie_prime_pannelli.id_pannello = pannelli_1.id_pannello INNER JOIN
                                                         db_tecnico.dbo.materie_prime ON db_tecnico.dbo.materie_prime_pannelli.id_materia_prima = db_tecnico.dbo.materie_prime.id_materia_prima
                               WHERE        (NOT (db_tecnico.dbo.materie_prime.codice_materia_prima LIKE 'DEM%'))) AS check_elettrificato ON db_tecnico.dbo.pannelli.id_pannello = check_elettrificato.id_pannello
WHERE        (dw_produzione.dbo.ordini_di_produzione.id_ordine_di_produzione = $id_ordine_di_produzione) AND (dw_produzione.dbo.distinta_ordini_di_produzione.id_distinta NOT IN
                             (SELECT        id_distinta
                               FROM            dbo.pannelli_caricati)) AND (dw_produzione.dbo.distinta_ordini_di_produzione.stazione =
                             (SELECT        id_stazione
                               FROM            dw_produzione.dbo.stazioni
                               WHERE        (nome = 'assemblaggio_byrb')))
ORDER BY db_tecnico.dbo.pannelli.codice_pannello";
    //}
    $options = array("QueryTimeout" => 240);
	$result2 = sqlsrv_query($conn, $query2, array(), $options);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $pannello["id_distinta"]=$row2['id_distinta'];
            $pannello["id_pannello"]=$row2['id_pannello'];
            $pannello["numero_cabina"]=utf8_encode($row2['numero_cabina']);
            $pannello["codice_pannello"]=utf8_encode($row2['codice_pannello']);
            $pannello["elettrificato"]=$row2['elettrificato'];
            $pannello["configurazione"]=strtoupper($row2['configurazione']);
            $pannello["profilo"]=$row2['profilo'];
            $pannello["ang"]=$row2['ang'];
            $pannello["halt"]=$row2['halt'];
            $pannello["lung1"]=$row2['lung1'];
            $pannello["lung2"]=$row2['lung2'];

            array_push($pannelli,$pannello);
        }
    }
    else
        die(print_r(sqlsrv_errors(),TRUE));

    echo json_encode($pannelli);

?>