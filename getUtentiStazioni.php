<?php

    include "connessione.php";

    $utenti=[];

    $query2="SELECT * FROM dbo.utenti_stazioni WHERE eliminato='false' AND [hidden]='false' ORDER BY [username]";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $utente["id_utente"]=$row2['id_utente'];
            $utente["username"]=$row2['username'];

            array_push($utenti,$utente);
        }
    }
    else
        die("error");

    echo json_encode($utenti);

?>