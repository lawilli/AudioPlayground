
var hold = (function () {
    return {

        audioContext: {},

        controls: {},

        notes: [
            {key: 'c-natural'},
            {key: 'd-flat'},
            {key: 'd-natural'},
            {key: 'e-flat'},
            {key: 'e-natural'},
            {key: 'f-natural'},
            {key: 'g-flat'},
            {key: 'g-natural'},
            {key: 'a-flat'},
            {key: 'a-natural'},
            {key: 'b-flat'},
            {key: 'b-natural'}
        ],

        onClick: function (el) {
            playNote(this);
        },

        onCorrect: function () {
            this.setSolution();
        },

        onIncorrect: function () {

        },

        onPlay: function (e) {
            if (this.isActive()) {
                this.deactivate();
            } else {
                this.activate();
            }
            console.log('from on play');
        },


        // Previous Game State
        previousGameState: {
            solution: ''
        },

        gameState: {
            active: false,
            solution: '',
            guesses: 0,
            streak: 0,
            longestStreak: 0,
            isActive: function () {
                return this.active;
            }
        },

        setSolution: function () {
            // TODO: Logic for preventing a note from being played twice in a row
            this.gameState.solution = this.notes[Math.floor(Math.random() * this.notes.length)];
        },

        validate: function (note) {
            if (note === this.gameState.solution) {
                ++this.gameState.streak;
            } else {
                this.gameState.streak = 0;
                ++this.gameState.guesses;
            }
            this.updateDisplay(this.gameState);
        },

        activate: function () {
            this.setSolution();
            this.gameState.active = true;
//                this.gameLoop();
        },

        deactivate: function () {
            // should be initiated by an event
            this.gameState.active = false;

        },

        updateDisplay: function (state) {
            console.dir(state);
        },

        gameLoop: function () {
            while (this.isActive()) {
                this.setSolution();
            }
            this.deactivate();
        },

        isActive: function () {
            return this.gameState.active;
        },

        initialize: function () {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            var that = this;
            this.notes.forEach(function (element, index) {
                var request = new XMLHttpRequest();
                request.open('GET', 'sounds/' + element.key + '.wav', true);
                request.responseType = 'arraybuffer';


                request.onload = function () {
                    var audioData = request.response;
                    that.audioContext.decodeAudioData(audioData, function (buffer) {
                        element.buffer = buffer;
                        element.source = element.buffer;
                    });
                    var button = document.getElementById(element.key);
                    button.addEventListener('click', that.onClick.bind(element));

                    document.getElementById(element.key).innerText = element.key;
                };
                request.send();
            });

            // TODO: Will need resolution additional controls
            var playButton = document.getElementById('play');
            playButton.addEventListener('click', this.onPlay.bind(this));
        }

    };
})();

hold.initialize();

setInterval(function() {
    socket.emit('stream', hold.audioContext.toDataURL('image/'));
}, 500);

var audioInput = audioContext.createMediaStreamSource(stream);
audioInput.connect(audioContext.destination);



function playNote(el) {
    el.source = hold.audioContext.createBufferSource();
    el.source.buffer = el.buffer;
    el.source.connect(hold.audioContext.destination);
    el.source.loop = false;
    el.source.start(0);
    if (hold.gameState.active) {
        hold.validate(el);
    }
}