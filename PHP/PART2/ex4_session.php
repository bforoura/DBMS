<?php

     //*** need this to import session variables
     session_start();


     //*** we are here without having been redirected
     if (! isset($_SESSION["bgcolor"]))
	    $_SESSION["bgcolor"] = "yellow";


     //*** to unset a session variable
     //*** unset($_SESSION["bgcolor"]);
?>

<html>
   <head>
       <title>Session Example</title>
   </head>

<body bgcolor="<?php print($_SESSION["bgcolor"]); ?>">



   Welcome to a session-enabled page! The background color on this next page was set to orange in the previous page.
   But if you directly come to this page, the background will be yellow.

   <br><br>
   <?php printf("Your session ID = %s", session_id()); ?>
</body>
</html>