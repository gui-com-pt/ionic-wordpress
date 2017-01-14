module.exports = function(config) {
    var dir = '.';

    config.set({

    basePath: '',

    frameworks: ['jasmine'],

    files: [
        'bower_components/ionic/release/js/ionic.bundle.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-utf8-base64/angular-utf8-base64.min.js',
        'bower_components/moment/moment.js',
        'bower_components/angular-moment/angular-moment.js',
        'bower_components/moment/locale/pt.js',
        'www/js/wcapi.js',
        dir + '/src/*.mdl.js',
        dir + '/src/*/*.mdl.js',
        dir + '/src/**/*/*.mdl.js',
        dir + '/src/*.js',
        dir + '/src/**/*.js',
        dir + '/tests/*.js',
        dir + '/tests/**/*.js',
        'www/js/templates.js'
    ],

    exclude: [
    ],


    preprocessors: {
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false,

    concurrency: Infinity
    });
}