<?php
header("Content-Type: text/xml");
print file_get_contents($_GET["lien"]);
?>
