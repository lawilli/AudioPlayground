/*global define*/
define([
    'jquery',
    'backbone',
    'views/app',
    'views/listener'
], function ($, Backbone, AppView, ListenerView) {
    'use strict';

    return Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start();
        },
        routes: {
            '': 'index',
            '/listener': 'listener'
        },

        index: function() {
            new AppView().render();
        },

        listener: function() {
            new ListenerView();
        }

    });
});