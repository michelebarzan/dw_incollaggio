<?php

    include "connessione.php";
	
    $id_distinta= $_POST['id_distinta'];
    $id_utente= $_POST['id_utente'];
    $stazione= $_POST['stazione'];

    $q2="INSERT INTO [dbo].[pannelli_linea] ([id_distinta],[stazione],[utente],[dataOra])
        VALUES ($id_distinta,$stazione,$id_utente,GETDATE())";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }

?>