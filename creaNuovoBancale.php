<?php

    include "connessione.php";

    $id_utente=$_REQUEST["id_utente"];

    $query="INSERT INTO [dbo].[anagrafica_bancali] ([dataOraApertura],[utenteApertura],[stato]) VALUES (GETDATE(),$id_utente,'aperto')";
    $result=sqlsrv_query($conn,$query);
    if($result==FALSE)
        die("error2".$query);
?>