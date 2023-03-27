let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
//create a reference to the db Schema which is the model
let Tournament = require('../models/tournament');
let UserModel = require('../models/user');
let User = UserModel.User;

//we want to display the tournamentList
module.exports.displayTournamentList = (req, res, next) => {
   
    Tournament.find((err, tournamentList) => {
        if (err) {
            return console.error(err);
        }
        else {
            if (req.user!=undefined){
                User.find({ displayName: req.user.displayName }).exec((err, user) => {
                    if (err) return handleError(err); 
                    console.log('displayTournamentList user:'+user);
                    res.render('tournament/list', { title: 'Tournaments', TournamentList: tournamentList, user: user, displayName:req.user?req.user.displayName:'' });
                });
            }else{
                res.render('tournament/list', { title: 'Tournaments', TournamentList: tournamentList, displayName:req.user?req.user.displayName:'' });
            }
        }
    });
}
module.exports.displayAddPage = (req, res, next) => {

    User.find({ displayName: req.user.displayName }).exec((err, user) => {
        if (err) return handleError(err);       
        res.render('tournament/add', {title:'Add Tournament', user: user, displayName:req.user?req.user.displayName:''})

    });

   
}

module.exports.processAddPage = (req, res, next) => {
    let newTournament = Tournament({
        "name": req.body.name,
        "userID": req.body.userID,        
        "description": req.body.description,
        "status": req.body.status

    });
    Tournament.create(newTournament, (err, Tournament) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.redirect('/tournamentList');
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
            res.render('tournament/edit', { title: 'Edit Tournament', tournament: tournamentToEdit,displayName:req.user?req.user.displayName:'' });
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
            
            res.redirect('/tournamentList');
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
            res.redirect('/tournamentList');
        }
    });
}

module.exports.displayDetailsPage = (req, res, next) => {
    let id = req.params.id;
    Tournament.findById(id, (err, tournamentToEdit) => {
        if (err) {
            console.log(err);
            res.end(err);
        }
        else {
            res.render('tournament/details', { title: 'Tournament Details', tournament: tournamentToEdit, displayName:req.user?req.user.displayName:'' });
        }
    });
}
