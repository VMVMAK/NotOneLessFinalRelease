let mongoose = require('mongoose');
let playerModel = mongoose.Schema({
    playername: String,    
    round1Winner: Boolean,
    round2Winner: Boolean,
    round3Winner: Boolean,
    tournamentID: String,
    position: Number
},
    {
        collection: "Player"
    });

module.exports = mongoose.model('player', playerModel);