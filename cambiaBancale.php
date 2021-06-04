<?php

    include "connessione.php";

    $id_bancale=$_REQUEST["id_bancale"];
    $id_utente=$_REQUEST["id_utente"];

    $query1="UPDATE dbo.anagrafica_bancali SET stato='in_pausa' WHERE id_bancale=$id_bancale";	
    $result1=sqlsrv_query($conn,$query1);
    if($result1==FALSE)
        die("error");

    $query2="SELECT * FROM dbo.anagrafica_bancali WHERE stato='in_pausa' AND id_bancale<>$id_bancale";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        $rows = sqlsrv_has_rows( $result2 );
        if ($rows === true)
        {
            $query3="UPDATE dbo.anagrafica_bancali SET stato='aperto' WHERE stato='in_pausa' AND id_bancale<>$id_bancale";	
            $result3=sqlsrv_query($conn,$query3);
            if($result3==FALSE)
                die("error");
        }
        else 
        {
            $query4="INSERT INTO [dbo].[anagrafica_bancali] ([dataOraApertura],[utenteApertura],[stato]) VALUES (GETDATE(),$id_utente,'aperto')";
            $result4=sqlsrv_query($conn,$query4);
            if($result4==FALSE)
                die("error2".$query4);
        }
    }
    else
        die("error");

?>