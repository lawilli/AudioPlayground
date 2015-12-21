/*global require*/
'use strict';

// Require.js allows us to configure shortcut alias
require.config({

    // Sets the js folder as the base directory for all future relative paths
    baseUrl: "./js",

    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        backboneLocalstorage: {
            deps: ['backbone'],
            exports: 'Store'
        }
    },
    paths: {
        jquery: '../jquery-2.1.4.min/index',
        underscore: '../underscore/underscore-min',
        backbone: '../backbone/backbone-min',
        backboneLocalstorage: '../backbone.localstorage/backbone.localStorage-min',
        socketio: 'https://cdn.socket.io/socket.io-1.3.7',
        text: '../text/text'
    }
});

require([
    'backbone',
    'views/app',
    'routers/router'
], function (Backbone, AppView, Workspace) {
    /*jshint nonew:false*/

    new Workspace();
});