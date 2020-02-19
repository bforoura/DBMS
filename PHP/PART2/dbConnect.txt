<?php

    include "mySQLConnect.php";

    //*** connect to mysql or oracle
    $query = "select * from users";
    executeQuery($query);

?>
