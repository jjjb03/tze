/* 
 * Copyright (c) 2015, Johannes Boost <jjjb at usw-tools.de>
 *
 * Lizenziert unter: Creative Commons Lizenzvertrag - CC-BY-NC-SA-3.0
 * Namensnennung - Nicht-kommerziell - Weitergabe unter gleichen Bedingungen
 * http://creativecommons.org/licenses/by-nc-sa/3.0/de/legalcode
 */

var framework = {
    js_files: [
        // jQuery
        'bower_components/jquery/dist/jquery.js',
        // Bootstrap
        'bower_components/bootstrap/dist/js/bootstrap.js',
        // Bootbox
        'bower_components/bootbox/bootbox.js',
        // jQuery UI // must load __after__ bootstrap
        'bower_components/jquery-ui/ui/core.js',
        'bower_components/jquery-ui/ui/widget.js',
        'bower_components/jquery-ui/ui/mouse.js',
        'bower_components/jquery-ui/ui/position.js',
        'bower_components/jquery-ui/ui/draggable.js',
        'bower_components/jquery-ui/ui/resizable.js',
        'bower_components/jquery-ui/ui/button.js',
        'bower_components/jquery-ui/ui/datepicker.js',
        'bower_components/jquery-ui/ui/dialog.js',
        'bower_components/jquery-ui/ui/i18n/datepicker-de.js',
        // jTable
        'bower_components/jtable/lib/jquery.jtable.js',
        'bower_components/jtable/lib/localization/*de.js',
        // jQuery Timepicker
        'bower_components/jqueryui-timepicker-addon/dist/jquery-ui-timepicker-addon.js',
        'bower_components/jqueryui-timepicker-addon/dist/i18n/*de.js',
        // jQuery Form Validator
        'bower_components/jquery-form-validator/form-validator/jquery.form-validator.js',
        // jQuery Binary Transport
        'bower_components/js-jquery/BinaryTransport/jquery.binarytransport.js',
        // eigene Anpassungen
        'src/js/framework/**/*.js'
    ],
    css_files: [
        // jQuery UI
        'bower_components/jquery-ui/themes/smoothness/jquery-ui.css',
        // jQuery Timepicker
        'bower_components/jqueryui-timepicker-addon/dist/jquery-ui-timepicker-addon.css',
        // jTable
        //'bower_components/jtable/lib/themes/lightcolor/gray/jtable.css',
        // Bootstrap
        //'bower_components/bootstrap/dist/css/bootstrap.css',
        //'bower_components/bootstrap/dist/css/bootstrap-theme.css',
        // eigene Anpassungen
        'src/css/framework/**/*.css'
    ],
    img_files: [
        // jQuery UI
        'bower_components/jquery-ui/themes/smoothness/images/*.png',
        // jTable
        'bower_components/jtable/lib/themes/lightcolor/*.png',
        'bower_components/jtable/lib/themes/lightcolor/gray/loading.gif',
        'src/res/**.*'
    ],
    other: [
        // bottstrap fonts
        'bower_components/bootstrap/fonts/*',
    ]
};

module.exports = function (grunt) {
    var sshconf = grunt.file.readJSON('ssh.json');
    
    sshconf.srcBasePath = "dist/";
    sshconf.createDirectories = true;

    if (sshconf.privateKeyFile !== undefined) {
        sshconf.privateKey = grunt.file.read(sshconf.privateKeyFile);
    }

    var license = grunt.util.normalizelf(grunt.file.read('license.txt'));
    license = license.split(grunt.util.linefeed);
    license.forEach(function (val, ind) {
        if (ind === 0) {
            license = "";
        }
        license += " * " + val + "\n";
    });

    framework.js = function () {
        return grunt.file.expand(framework.js_files);
    };
    framework.css = function () {
        return grunt.file.expand(framework.css_files);
    };
    framework.listing = function (ele) {
        var listing = '';
        ele.forEach(function (v, i) {
            ++i;
            listing += " * " + i + ":\t" + v + "\n";
        });
        return listing;
    };
    framework.banner = function (listing) {
        var banner = '/*!\n';
        banner += ' * Framework für <%= pkg.name %> (<%= pkg.version %>)';
        banner += ' - Erstellt am <%= grunt.template.today("dd-mm-yyyy") %>\n';
        banner += ' *\n';
        banner += license;
        if (listing !== undefined) {
            banner += ' *\n';
            banner += ' * Enthält:\n';
            banner += framework.listing(listing);
        }
        banner += ' */\n';

        return banner;
        //return '/*!\n * Framework für <%= pkg.name %> (<%= pkg.version %>)' +
        //        ' - Erstellt am <%= grunt.template.today("dd-mm-yyyy") %>\n *\n' +
        //        license + ' *\n * Enthält:\n' + framework.listing(listing) + ' */\n';
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                ignores: 'src/js/framework.js',
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            },
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
        },
        less: {
            framework_css: {
                expand: true,
                cwd: 'src/less/',
                src: 'framework/**/*.less',
                dest: 'src/css/',
                ext: '.css',
                extDot: 'last',
                filter: 'isFile'
            },
            sites_css: {
                expand: true,
                cwd: 'src/less/',
                src: 'sites/**/*.less',
                dest: 'src/css/',
                ext: '.css',
                extDot: 'last',
                filter: 'isFile'
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ''
            },
            framework_js: {
                options: {
                    banner: framework.banner(framework.js()) + "'use strict';\n",
                    process: function (src, filepath) {
                        return '// Source: ' + filepath + '\n' +
                                src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                    }
                },
                src: [
                    framework.js()
                ],
                dest: 'build/js/framework.js'
            },
            framework_css: {
                options: {
                    // the banner is inserted at the top of the output
                    banner: framework.banner(framework.css()),
                    process: function (src, filepath) {
                        return '/* Source: ' + filepath + ' */\n' + src
                                .replace(/url\(('|")(.*\/)?(.*\.)(png|gif)('|")/gi, 'url\($1../res/$3$4$5')
                                .replace(/\/fonts\//gi, '/other/');
                    }
                },
                src: [
                    framework.css()
                ],
                dest: 'build/css/framework.css'
            },
            sites_js: {
                files: [{
                        src: 'src/js/TZE/**/*.js',
                        dest: 'build/js/<%= pkg.name %>.js'
                    }, {
                        src: 'src/js/admin/**/*.js',
                        dest: 'build/js/<%= pkg.name %>.admin.js'
                    }]
            },
            sites_css: {}
        },
        uglify: {
            framework_js: {
                options: {
                    banner: framework.banner(framework.js())
                },
                expand: true,
                src: '<%= concat.framework_js.dest%>',
                ext: '.min.js'
            },
            sites_js: {
                options: {
                    banner: '/*!\n * Script für <%= pkg.name %> (<%= pkg.version %>)' +
                            ' - Erstellt am <%= grunt.template.today("dd-mm-yyyy") %>\n *\n' +
                            license + ' */\n'
                },
                expand: true,
                src: ['build/js/*.js', '!build/js/framework*.js', '!build/js/*.min.js'],
                extDot: 'last',
                ext: '.min.js'
            }
        },
        cssmin: {
            framework_css: {
                expand: true,
                src: '<%= concat.framework_css.dest%>',
                ext: '.min.css'
            },
            sites_css: {
                expand: true,
                cwd: 'src/less/',
                src: 'sites/**/*.less',
                dest: 'src/css/',
                ext: '.css',
                extDot: 'last',
                filter: 'isFile'
            }
        },
        watch: {
            css: {
                files: ["src/less/**/*.less", "src/css/**/*.css"],
                tasks: ['CSS:framework_css', 'CSS:sites_css']
            },
            sites_js: {
                files: ["src/js/**/*.js", "!src/js/framework/**/*.js"],
                tasks: ['JS:sites_js']
            },
            framework_js: {
                files: ["src/js/framework/**/*.js"],
                tasks: ['JS:framework_js']
            }
        },
        copy: {
            framework_js: {
                expand: true,
                cwd: 'build/js/',
                src: '**/framework*',
                dest: 'dist/www/js/',
                filter: 'isFile'
            },
            framework_css: {
                expand: true,
                cwd: 'build/css/',
                src: '**/framework*',
                dest: 'dist/www/css/',
                filter: 'isFile'
            },
            framework_img: {
                expand: true,
                flatten: true,
                src: framework.img_files,
                dest: 'dist/www/res/',
                filter: 'isFile'
            },
            framework_other: {
                expand: true,
                flatten: true,
                src: framework.other,
                dest: 'dist/www/other/',
                filter: 'isFile'
            },
            sites_js: {
                cwd: 'build/',
                src: ['js/*.js', '!js/framework*.js'],
                expand: true,
                dest: 'dist/www',
                filter: 'isFile'
            },
            sites_css: {
                cwd: 'build/',
                src: ['css/*.css', '!css/framework*.css'],
                expand: true,
                dest: 'dist/www',
                filter: 'isFile'
            }
        },
        sftp: {
            options: sshconf,
            framework_js:
                    'dist/www/js/**/framework*',
            framework_css:
                    'dist/www/css/**/framework*',
            framework_img:
                    'dist/www/res/**',
            framework_other:
                    'dist/www/other/**',
            sites_js: [
                'dist/www/js/*.js',
                '!dist/www/js/framework*.js'
            ],
            sites_css: [
                'dist/www/css/*.css',
                '!dist/www/css/framework*.css'
            ],
            php: [
                'dist/**/*.php', 'dist/**/*.inc'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-ssh');

    grunt.registerTask('test', ['jshint']);

    var runEach = function (tasks, target) {
        if (target !== undefined) {
            target = ":" + target;
        } else {
            target = "";
        }

        tasks.forEach(function (v, i) {
            tasks[i] = v + target;
        });

        grunt.task.run(tasks);
    };

    grunt.registerTask('CSS', function (task) {
        runEach(['less', 'concat', 'cssmin', 'copy', 'sftp'], task);
    });

    grunt.registerTask('JS', function (task) {
        runEach(['test', 'concat', 'uglify', 'copy', 'sftp'], task);
    });

    grunt.registerTask('framework_css', ['CSS:framework_css']);
    grunt.registerTask('framework_js', ['JS:framework_js']);

    grunt.registerTask('framework',
            [
                'framework_css',
                'framework_js',
                'copy:framework_img',
                'copy:framework_other'
            ]);

    grunt.registerTask('sites',
            [
                'CSS:sites_css',
                'JS:sites_js'
            ]);

    grunt.registerTask('default',
            [
                'sites',
                'framework'
            ]);

    grunt.registerTask('watchlist', function () {
        grunt.log.write(grunt.config.get('less'));
    });
};  