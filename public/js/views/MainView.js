// MainView.js
// -------
define(['jquery', 'backbone', "text!templates/main.html", 'underscore', '../models/Model'],

    function($, Backbone, template, _, Note) {
        'use strict';

        return Backbone.View.extend({

            // The DOM Element associated with this view
            el: 'main',

            // View Event Handlers
            events: {

                'click .note-button': 'onClick'
            },

            model: Note,

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