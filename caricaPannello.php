<?php

    include "connessione.php";
	
    $id_distinta= $_POST['id_distinta'];
    $id_utente= $_POST['id_utente'];
    $stazione= $_POST['stazione'];
    $faccia= $_POST['faccia'];
    $NumeroDima= $_POST['NumeroDima'];
    $ruotato= $_POST['ruotato'];

    $q2="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima],[ruotato])
        SELECT $id_distinta,$stazione,$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima),'$ruotato'";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
        die("error".$q2);

	if($faccia == "fronte")
	{
		$fogli = 1;

		$query12="SELECT MAX (foglio) AS fogli FROM [dw_incollaggio].[dbo].[table_taglio_lana] WHERE pannello = (select pannello from dw_produzione.dbo.distinta_ordini_di_produzione where id_distinta = $id_distinta)";
		$result12=sqlsrv_query($conn,$query12);
		if($result12==TRUE)
		{
			while($row12=sqlsrv_fetch_array($result12))
			{
				$fogli=$row12['fogli'];
			}
		}
		else
			die("error");

		$stazioni = ['fresatura_lana','taglio_lana'];
		foreach ($stazioni as $stazione)
		{
			for ($foglio=1; $foglio <= $fogli; $foglio++)
			{
				$q5="INSERT INTO [dbo].[fogli_lana_pannelli] ([id_distinta],[faccia],[foglio],[stazione])
					SELECT $id_distinta,'$faccia',$foglio,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = '$stazione')";
				$r5=sqlsrv_query($conn,$q5);
				if($r5==FALSE)
					die("error".$q5);
			}
		}
	}

	//se sta caricando un pannello retro inserisci direttamente le lavorazioni per fresatura e taglio lana, cosi il retro non compare tra i pannelli da fare in quelle due stazioni
	if($faccia=='retro')
	{
		$stazioni = ['fresatura_lana','taglio_lana'];
		foreach ($stazioni as $stazione)
		{
			$q3="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima],[ruotato])
				SELECT $id_distinta,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = '$stazione'),$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima),'$ruotato'";
			$r3=sqlsrv_query($conn,$q3);
			if($r3==FALSE)
				die("error".$q3);
		}
	}

?>