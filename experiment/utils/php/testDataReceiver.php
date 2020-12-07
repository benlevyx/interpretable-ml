<?php
/**
 * receives and immediately displays any data sent to it via POST or GET
 *
 * Created by PhpStorm.
 * User: kgajos
 * Date: 6/5/16
 * Time: 10:20 AM
 */

echo "DATA RECEIVED <br/>\n";
highlight_string("<?php\n\$data =\n" . var_export($_REQUEST, true) . ";\n?>");