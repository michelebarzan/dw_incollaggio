<?php

    include "connessione.php";
	
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
        echo $q2;

?>