# TZE

Ticket- und Zeiterfassung, basierend auf PHP

## Install

```sh
$ git clone https://usw-tools.de/git/tze-php.git
$ cd tze-php
$ composer install
$ npm i --production
```

## Settings
edit `includes/settings.json`

## SQL Setup

see `includes/createTZE.sql`

## Run

link /www to your webserver 

example for lighttpd:
```
    alias.url = ( "/tze" => "/path/to/tze/www/" )
```

## UI-Frameworks:
* [jQuery]
* [jQuery ui]
* [bootstrap]
* [jtable]
* [jquery-ui-timepicker-addon]
* [jquery.binarytransport]

[jQuery]:http://jquery.com
[jQuery ui]:http://www.jqueryui.com
[bootstrap]:http://www.getbootstrap.com
[jtable]:http://www.jtable.org
[jquery-ui-timepicker-addon]:https://github.com/trentrichardson/jQuery-Timepicker-Addon
[jquery.binarytransport]:https://github.com/henrya/js-jquery

## Server-Frameworks:
* [PHPOffice/PHPExcel]
* [phpPasswordHashingLib] (PHP 5.5-like password functions)
* [array_column()] (PHP 5.5-like array_column())

[PHPOffice/PHPExcel]:https://github.com/PHPOffice/PHPExcel.git
[phpPasswordHashingLib]:https://github.com/Antnee/phpPasswordHashingLib
[array_column()]:https://github.com/ramsey/array_column.git

## License
Copyright (c) 2015, Johannes Boost [jjjb@usw-tools.de]

licensed under: [Creative Commons - BY-NC-SA-3.0]

[jjjb@usw-tools.de]:mailto:jjjb@usw-tools.de
[Creative Commons - BY-NC-SA-3.0]:https://creativecommons.org/licenses/by-nc-sa/3.0/
