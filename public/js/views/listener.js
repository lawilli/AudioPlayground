// MainView.js
// -------
define(['jquery', 'backbone', "text!templates/listener.html", 'underscore'],

    function($, Backbone, template, _) {
        'use strict';

        return Backbone.View.extend({

            // The DOM Element associated with this view
            el: '.app',

            // View Event Handlers
            events: {

                'click .note-button': 'onClick'
            },

            // View constructor
            initialize: function() {


                // Calls the view's render method
                this.render();

            },



            // Renders the view's template to the UI
            render: function() {

                // Setting the view's template property using the Underscore template method
                this.template = _.template(template, {});

                // Dynamically updates the UI with the view's template
                this.$el.html(this.template);

                // Maintains chainability
                return this;

            }

        });

    }

);