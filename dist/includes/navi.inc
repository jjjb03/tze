<?php
/*
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 * 
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

include_once __DIR__ . "/settings.inc";

$nav[] = array(
    'name' => 'Verwaltung', 'url' => $Project_Root . 'admin.php', 'need' => 'iAdmin', "addClass" => "hidden-xs"
);
$navbar .= '<ul class="nav navbar-nav">';
foreach ($nav as $el) {
    if (!empty($el['need'])) {
        if (empty($_SESSION[$el['need']]) || !$_SESSION[$el['need']]) {
            continue;
        }
    }
    $navbar .= '<li';
    $navbar .= ' class="' . $el['addClass'] . '';
    if ($el['url'] == $_SERVER['PHP_SELF']) {
        $navbar .= ' active';
    };
    $navbar .= '"><a href="' . $el['url'] . '">' . $el['name'] . '</a></li>';
}
$navbar .= '<li><a href="#" id="popout" class="hidden-xs" title="In eigenem Fenster öffnen"><span class="glyphicon glyphicon-new-window"></span></a></li>';
$navbar .= '</ul>';
?>  

<header>
    <div style="
         width: 100%; 
         height: 300px; 
         position: fixed; 
         background-color: rgb(103, 154, 201); 
         border-bottom: 6px solid rgb(202, 0, 58); 
         top: 0px;
         z-index: -1;">
        <div class="hidden-xs" style="
             position: absolute;
             top: 50px; 
             height: 300px; 
             background-color: white; 
             right: 50%; 
             left: 0px; 
             margin: 0px; 
             padding: 0px; 
             width: 50%;"></div>
        <div class="hidden-sm hidden-md hidden-lg" style="
             position: absolute;
             width: 100%; 
             top: 50px;
             background: white none repeat scroll 0% 0%;
             height: 100%;
             border-top: 3px solid rgb(202, 0, 58) ! important;
             "></div>
        <div class="container hidden-xs" style="margin: 50px auto;">
            <div style="
                 height: 250px;
                 margin-right: -25px;
                 border-top-right-radius: 25px;
                 background: white none repeat scroll 0% 0%;">
                <div style="
                     position: relative;
                     top: 250px;
                     left:100%;
                     width: 5px;
                     height: 200px;
                     background-color: white;
                     border: none;
                     background-image: url('res/header_sideshadow.jpg');
                     background-repeat: no-repeat;
                     background-position: left center;
                     "></div>
            </div>
        </div>
    </div>
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" data-aria-expanded="false" data-aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="<?php echo $sProject_URL; ?>"><img style="margin-top: -5px; padding: 2px 7px; border-radius: 6px; background: #fff; width: 170px" src="res/logo.png"></a>
            </div>
            <div id="navbar" class="collapse navbar-collapse">
                <?php
                print $navbar;
                if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
                    print '<div class="nav navbar-right dropdown">'
                            . '<div class="nav navbar-text dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">'
                            . 'Angemeldet als ' . $_SESSION['sVorname'] . '&nbsp;' . $_SESSION['sNachname']
                            . '<span class="caret"></span></div>'
                            . '<ul class="dropdown-menu" role="menu">'
                            . '<li><a href="' . $sProject_URL . 'password.php">Passwort ändern</a></li>'
                            . '<li class="divider"></li>'
                            . '<li><a href="logout.php">Ausloggen</a></li>'
                            . '</ul>'
                            . '</div>';
                }
                ?>
            </div><!--/.nav-collapse -->
        </div>
    </nav>
</header>