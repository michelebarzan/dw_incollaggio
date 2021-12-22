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
    {
        die("error".$q2);
    }
    else
	{
		if($faccia=='retro')
		{
			$q3="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima],[ruotato])
				SELECT $id_distinta,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'fresatura_lana'),$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima),'$ruotato'";
			$r3=sqlsrv_query($conn,$q3);
			if($r3==FALSE)
			{
				die("error".$q3);
			}
			else
			{
				$q4="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra],[faccia],[dima],[ruotato])
					SELECT $id_distinta,(SELECT id_stazione FROM anagrafica_stazioni WHERE nome = 'taglio_lana'),$id_utente,GETDATE(),'$faccia',(SELECT id_dima FROM anagrafica_dime WHERE NumeroDima=$NumeroDima),'$ruotato'";
				$r4=sqlsrv_query($conn,$q4);
				if($r4==FALSE)
				{
					die("error".$q4);
				}
			}
		}
	}

?>