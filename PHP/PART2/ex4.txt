<?php

     //*** start a new session
     session_start();

     //*** set a session variable
     $_SESSION["bgcolor"] = "orange";


     //*** kill a session
     //session_destroy();
?>


<html>
   <head>
       <title>Session Example</title>
   </head>

<body bgcolor="<?php print($_SESSION["bgcolor"]); ?>">

   Welcome to a session-enabled page! The background color on the next page will be set to orange.<p>
   <a href = "ex4_session.php">Go to another session-enabled page</a>.


   <br><br>
   <?php printf("Your session ID = %s", session_id()); ?>
</body>
</html>