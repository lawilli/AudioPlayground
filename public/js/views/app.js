/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/main.html',
    'text!templates/messages/correct.html',
    'text!templates/messages/incorrect.html',
    'text!templates/messages/query.html',
    'socketio'
], function ($, _, Backbone, template, CorrectMessage, IncorrectMessage, QueryMessage, socket) {
    'use strict';

    // Our overall **AppView** is the top-level piece of UI.
    return Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '.app',

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            //'click .mu-control-play': 'onPlay',
            //'click .mu-control-stop': 'onStop'
            'stream': 'onStream',
            'touchstart': 'onClick'
        },


        notes: [
            {key: '261-c', format: 'C'},
            {key: '277-c-sharp', format: 'C<sup>#</sup>'},
            {key: '293-d', format: 'D'},
            {key: '311-d-sharp', format: 'D<sup>#</sup>'},
            {key: '329-e', format: 'E'},
            {key: '349-f', format: 'F'},
            {key: '369-f-sharp', format: 'F<sup>#</sup>'},
            {key: '391-g', format: 'G'},
            {key: '415-g-sharp', format: 'G<sup>#</sup>'},
            {key: '440-a', format: 'A'},
            {key: '466-a-sharp', format: 'A<sup>#</sup>'},
            {key: '495-b', format: 'B'},
            {key: '523-c', format: 'C'},
            {key: '545-c-sharp', format: 'C<sup>#</sup>'},
            {key: '587-d', format: 'D'},
            {key: '622-d-sharp', format: 'D<sup>#</sup>'},
            {key: '659-e', format: 'E'},
            {key: '698-f-sharp', format: 'F<sup>#</sup>'},
            {key: '698-f', format: 'F'},
            {key: '783-g', format: 'G'},
            {key: '830-g-sharp', format: 'G<sup>#</sup>'},
            {key: '880-a', format: 'A'},
            {key: '932-a-sharp', format: 'A<sup>#</sup>'},
            {key: '987-b', format: 'B'}
        ],

        initialize: function () {

            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };

            this.audioContext = new AudioContext();

            this.gameState = {
                active: false,
                solution: '',
                guesses: 0,
                streak: 0,
                longestStreak: 0
            };

            this.io = socket.connect('http://localhost:3000');

            var that = this;
            this.io.on('stream', function(data) {
                that.player = that.audioContext.createBufferSource();
                that.player.buffer = that.buffers.get(data).buffer;
                that.player.connect(that.audioContext.destination);
                that.player.loop = false;
                that.player.start(0);
            });



        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var that = this;

            this.buffers = new Map();


            this.notes.forEach(function (element, index) {
                var request = new XMLHttpRequest();
                request.open('GET', 'midia/' + element.key + '.mp3', true);
                request.responseType = 'arraybuffer';

                request.onload = function () {
                    var audioData = request.response;

                    that.audioContext.decodeAudioData(audioData, function (buffer) {
                        element.buffer = buffer;
                        element.source = element.buffer;
                        that.buffers.set(element.key, {buffer: buffer, source: buffer});
                    });

                    $("span[data-note=" + element.key + "]").bind('click', {element: element}, that.onClick.bind(that));
                };
                request.send();
            });

            var lockEvent = {};

            // Piano Play Keyboard
            // --------------------------------------------------
            $(window).bind('keydown keyup', function(ev) {
                var keyNo = ev.which;
                var $key = $('[data-key="'+keyNo+'"]');
                var note = $key.attr('data-note');
                if(note){
                    if (ev.type == 'keydown') {

                        if (!lockEvent[keyNo]) {
                            if (that.gameState.active) {
                                that.validate(note);
                            }
                            that.playBuffer(note);
                            lockEvent[keyNo] = true;
                            $key.addClass('active');
                            $key.parent().addClass('active');
                        }
                    }
                    else if (ev.type == 'keyup') {
                        lockEvent[keyNo] = false;
                        $key.removeClass('active');
                        $key.parent().removeClass('active');
                    }
                }
            });


            // Setting the view's template property using the Underscore template method
            // Dynamically updates the UI with the view's template
            this.$el.html(_.template(template));

            this.initControls();
            this.initMessages();
            this.player = document.getElementById('mulang-player');

            // Maintains chainability
            return this;
        },

        initControls: function () {

            this.controls = {};
            this.controls.play = document.getElementsByClassName('mu-control-play')[0];
            this.controls.stop = document.getElementsByClassName('mu-control-stop')[0];

            this.controls.play.addEventListener('click', this.onPlay.bind(this));
            this.controls.stop.addEventListener('click', this.onStop.bind(this));
        },

        initMessages: function () {
            this.messages = {};
            this.messages.correct = _.template(CorrectMessage);
            this.messages.incorrect = _.template(IncorrectMessage);
            this.messages.query = QueryMessage;


            this.message = document.getElementsByClassName('mulang-message')[0];

        },

        onPlay: function (e) {
            this.toggleVisibility(this.controls.play);
            this.toggleVisibility(this.controls.stop);
            this.activate();
            //this.updateDisplay({});

        },

        onStop: function (e) {
            this.deactivate();

            this.toggleVisibility(this.controls.stop);
            this.toggleVisibility(this.controls.play);
        },

        onStream: function(buff) {
            console.dir(buff);
            console.dir(this);
        },

        onClick: function (e) {
            this.playNote(e.data.element);
            if (this.gameState.active) {
                this.validate(e.data.element);
            }
        },

        playBuffer: function (buff) {
            this.player = this.audioContext.createBufferSource();

            if (typeof buff === 'string') {
                this.player.buffer = this.buffers.get(buff).buffer;
            } else {
                this.player.buffer = buff.buffer;
            }

            //this.player.buffer = buff ? buff.buffer : this.buffers.get(buff);
            this.player.connect(this.audioContext.destination);
            this.player.loop = false;
            this.player.start(0);
        },

        playNote: function (el) {
            this.io.emit('broad', el.key);
            el.source = this.audioContext.createBufferSource();
            el.source.buffer = el.buffer;
            el.source.connect(this.audioContext.destination);
            el.source.loop = false;
            el.source.start(0);
        },

        gameLoop: function () {
            if (this.gameState.active) {
                this.setSolution();
                this.gameState.guesses = 0;
                this.playBuffer(this.gameState.solution);
                this.updateDisplay(this.messages.query);
            }
        },

        activate: function () {
            this.gameState.active = true;
            this.gameLoop();

        },

        deactivate: function () {
            this.gameState.active = false;
            this.message.innerHTML = "";
        },

        setSolution: function () {
            this.gameState.solution = this.notes[Math.floor(Math.random() * this.notes.length)];
        },

        toggleVisibility: function (el) {
            el.style.display = el.style.display == 'none' ? 'inline-block' : 'none';
        },

        updateDisplay: function (message) {
            $(this.message).html(message);
            //this.message.innerHTML = message;
        },

        validate: function (el) {

            var that = this;
            if (this.gameState.solution.key == el.key || this.gameState.solution.key === el) {
                this.message.innerHTML = this.messages.correct({note: el.format});
                setTimeout(function () {
                    that.gameLoop();
                }, 3000);
            } else {
                this.gameState.guesses++;
                $(this.message).html(this.messages.incorrect({guesses: this.gameState.guesses}));
            }
        }

    });
});