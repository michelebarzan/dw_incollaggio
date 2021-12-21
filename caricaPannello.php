<?php

    include "connessione.php";

	set_time_limit(240);
	
    $id_distinta= $_POST['id_distinta'];
    $id_utente= $_POST['id_utente'];
    $stazione= $_POST['stazione'];
    $faccia= $_POST['faccia'];
    $NumeroDima= $_POST['NumeroDima'];

    $q2="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima])
        SELECT $id_distinta,$stazione,$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima)";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error".$q2);
    }
    else
	{
		/*if($faccia=='fronte')
		{
			$q3="INSERT INTO [dbo].[table_taglio_lana] ([faccia],[id_distinta],[n],[IdProduzione],[NPannelloInLavoro],[SpessorePannello],[OffsetYSfrido],[TipoLavorazione],[CoordinataX1],[CoordinataY1],[CoordinataX2],[CoordinataY2],[ValoreL],[ValoreH],[ValoreR],[AngoloAlpha],[AngoloBeta],[AngoloGamma],[tipo])
 				EXEC plc_taglio_lana_4 $id_distinta";
			$r3=sqlsrv_query($conn,$q3);
			if($r3==FALSE)
			{
				die("error".$q3);
			}
		}*/
		if($faccia=='retro')
		{
			$q3="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima])
				SELECT $id_distinta,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'fresatura_lana'),$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima)";
			$r3=sqlsrv_query($conn,$q3);
			if($r3==FALSE)
			{
				die("error".$q3);
			}
			else
			{
				$q4="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima])
					SELECT $id_distinta,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'taglio_lana'),$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima)";
				$r4=sqlsrv_query($conn,$q4);
				if($r4==FALSE)
				{
					die("error".$q4);
				}
			}
		}
	}

?>