<?php

	include "connessione.php";
	
    $username= $_REQUEST ['username'];
    $stazione= $_REQUEST ['stazione'];
    $id_utente= $_REQUEST ['id_utente'];

    session_start();
    $_SESSION['username']=$username;
    $_SESSION['id_utente']=$id_utente;
    $_SESSION['stazione']=$stazione;
    
    echo "ok";

    /*$error=true;

    $q2="SELECT * FROM utenti_stazioni";
    $r2=sqlsrv_query($conn,$q2);
    if($r2==FALSE)
    {
        die("error");
    }
    else
    {
        while($row2=sqlsrv_fetch_array($r2))
        {
            if($row2['username']==$username)
			{
                session_start();
                $_SESSION['username']=$username;
                $_SESSION['id_utente']=$row2['id_utente'];
                $_SESSION['stazione']=$stazione;
                
                echo "ok";
                $error=false;
                break;
			}
        }
        if($error)
        {
            die("error");
        }
    }*/

?>