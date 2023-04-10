let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
//create a reference to the db Schema which is the model
let Tournament = require('../models/tournament');
let UserModel = require('../models/user');
let Player = require('../models/player');
let User = UserModel.User;

//we want to display the tournamentList
module.exports.displayTournamentList = (req, res, next) => {
   
    Tournament.find((err, tournamentList) => {
        if (err) {
            return console.error(err);
        }
        else {
            if (req.user!=undefined){
                User.find({ _id: req.user._id }).exec((err, user) => {
                    if (err) return handleError(err);                     
                    res.render('tournament/list', { title: 'My Tournaments', TournamentList: tournamentList, user: user, displayName:req.user?req.user.displayName:'' });
                });
            }else{
                res.render('tournament/list', { title: 'My Tournaments', TournamentList: tournamentList, displayName:req.user?req.user.displayName:'' });
            }
        }
    });
}
module.exports.displayAddPage = (req, res, next) => {

    User.find({ _id: req.user._id}).exec((err, user) => {
        if (err) return handleError(err);       
        res.render('tournament/add', {title:'Add Tournament', user: user, displayName:req.user?req.user.displayName:''})

    });
    //User.find().exec((err, user) => {
    //    res.render('tournament/add', {title:'Add Tournament', user: user})
    //})
}

module.exports.processAddPage = (req, res, next) => {
    let newTournament = Tournament({
        "name": req.body.name,
        "userID": req.user._id,        
        "description": req.body.description,
        "status": req.body.status,
        "round" : 1
    });
    Tournament.create(newTournament, (err, Tournament) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            Player.findOne().sort('-position').exec((err, player) => {
                let newPlayers = [];
                for (let i = 0; i < 8; i++) {
                    newPlayers.push(Player({ 
                        "playername": req.body["player" + (i + 1)],
                        "round1Winner": false,
                        "round2Winner": false,
                        "round3Winner": false,
                        "tournamentID": newTournament._id,
                        "position": i+1
                    }));
                }
                Player.create(newPlayers, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    } else {
                        res.redirect('/tournamentList');
                    }
                });
            });
        }
    });
}

module.exports.displayEditPage = (req, res, next) => {
    let id = req.params.id;
    
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            let promises = [];
            for (let i = 0; i < 8; i++) {
                let promise = Player.findOne({tournamentID:id, position:i+1}).exec();
                promises.push(promise);
            }
            Promise.all(promises)
            .then ((players) => {
                let playernames = players.map((player) => player.playername);     
                res.render('tournament/edit', { 
                    title: 'Edit Tournament', 
                    tournament: tournamentToEdit,
                    displayName:req.user?req.user.displayName:'',
                    playernames:playernames
                });      
            })
            .catch((err) => {
                console.log(err);
                res.end(err);
            });
        }
    });
}

module.exports.processEditPage = (req, res, next) => {
    let id = req.params.id
    let updatedTournament = Tournament({
        "_id": id,
        "name": req.body.name,
        "userID": req.body.userID,        
        "description": req.body.description,
        "status": req.body.status     
    });
    
    Tournament.updateOne({ _id: id }, updatedTournament, (err) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            for (let i = 0; i < 8; i++) {
                let updatedPlayer = {
                    "playername": req.body["player" + (i + 1)]
                };
                Player.updateOne({ tournamentID: id, position: i+1 }, updatedPlayer).exec();  
            }
            res.redirect('/tournamentList'); 
        }
    });
}

module.exports.processPlayerPromo = (req, res, next) => {
    let id = req.params.id;
    let playerID = req.params.pid;
    let round = req.params.round;
    
    let updatedPlayer = Player({
        "_id": playerID,
        ["round"+round+"Winner"] : true
        
    });
    
    Player.updateOne({ _id: playerID }, updatedPlayer, (err) => {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            // check if round is finished           
            Player.find({tournamentID: id, ["round"+round+"Winner"]: true}).sort({position:1}).exec((err, players) => {
                if (err) {
                    console.log(err);
                    res.end(err);
                } else {             
                    
                    let updatedTournament = Tournament({
                        "_id": id,
                        "round": Number(round)+1     
                    });
                    
                    if ((round==1 && players.length==4) || (round==2 && players.length==2) || (round==3 && players.length==1)){
                        
                        Tournament.updateOne({ _id: id }, updatedTournament, (err) => {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            } else {                               
                               res.redirect('/tournamentList/details/'+(Number(round)+1)+'/'+id);                               
                            }
                        });                 
                    }else{                        
                        res.redirect('/tournamentList/details/'+round+'/'+id);
                    }
                    
                }
            });
            
           
        }
    });

    

}
module.exports.performDelete = (req, res, next) => {
    let id = req.params.id;
    Tournament.remove({ _id: id }, (err) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            Player.remove({tournamentID: id}, (err) => {
                if (err) {
                    console.log(err);
                    res.end(err);
                }
                else {
                    res.redirect('/tournamentList');
                }
            })
        }
    });
}

module.exports.displayDetailsPage = (req, res, next) => {
    let id = req.params.id;
    let round = req.params.round;
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            let query;
            if (round==1){
                query={tournamentID: id};
            }else{
                query={tournamentID: id, ["round"+(round-1)+"Winner"]: true};
            }
            
            Player.find(query).sort({position:1}).exec((err, players) => {
                
                if (err) {
                    console.log(err);
                    res.end(err);
                }   
                else {
                    Player.find({tournamentID: id}).sort({position:1}).exec((err, allPlayers) => {
                        if (err) {
                            console.log(err);
                            res.end(err);
                        }else{
                            
                            res.render('tournament/details', 
                            { title: 'Tournament Details', 
                            tournament: tournamentToEdit, 
                            displayName:req.user?req.user.displayName:'',
                            players: players,
                            allPlayers: allPlayers
                         });
                        }
                    });

                }
            })
        }
    });
}

/*
module.exports.displayDetailsPageTwo = (req, res, next) => {
    let id = req.params.id;
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            if (tournamentToEdit.round < 2) {
                res.render('tournament/return', {title: 'Tournament Details'});
            } 
            else {
                Player.find({tournamentID: id, round1Winner: true}).sort({position:1}).exec((err, players) => {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    }   
                    else {
                        res.render('tournament/details2', 
                            { title: 'Tournament Details', 
                            tournament: tournamentToEdit, 
                            displayName:req.user?req.user.displayName:'',
                            players: players
                        });
                    }
                })
            }  
        }
    });
}

module.exports.displayDetailsPageThree = (req, res, next) => {
    let id = req.params.id;
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            if (tournamentToEdit.round < 3) {
                res.render('tournament/return', {title: 'Tournament Details'});
            } 
            else {
                Player.find({tournamentID: id, round1Winner: true, round2Winner: true}).sort({position:1}).exec((err, players) => {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    }   
                    else {
                        res.render('tournament/details3', 
                            { title: 'Tournament Details', 
                            tournament: tournamentToEdit, 
                            displayName:req.user?req.user.displayName:'',
                            players: players
                        });
                    }
                })
            }
        }
    });
}

module.exports.displayDetailsFinal = (req, res, next) => {
    let id = req.params.id;
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            if (tournamentToEdit.round < 4) {
                res.render('tournament/return', {title: 'Tournament Details'});
            } 
            else {
                Player.find({tournamentID: id, round1Winner: true, round2Winner: true, round3Winner: true}).sort({position:1}).exec((err, players) => {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    }   
                    else {
                        res.render('tournament/details4', 
                            { title: 'Tournament Details', 
                            tournament: tournamentToEdit, 
                            displayName:req.user?req.user.displayName:'',
                            players: players
                        });
                    }
                })
            }
        }
    });
}
*/