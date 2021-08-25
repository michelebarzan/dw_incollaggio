<?php

    include "connessione.php";

    $query2="SELECT TOP (1) * FROM [tabella_allarmi]";	
    $result2=sqlsrv_query($conn,$query2);
    if($result2==TRUE)
    {
        while($row2=sqlsrv_fetch_array($result2))
        {
            $error_message["Stringa"]=$row2['Stringa'];
            $error_message["id_tabella_allarmi"]=$row2['id_tabella_allarmi'];
			
			echo json_encode($error_message);
        }
    }
    else
        die("error");

?>