let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let passport = require('passport');
//helper function for guard purposes
function requireAuth(req, res, next)
{
    //check if the user is logged in
    if (!req.isAuthenticated())
    {
        return res.redirect('/login')
    }
    next();
}
//connect to our tournament model
let Tournament = require('../models/tournament');
let tournamentController = require('../controllers/tournament');
//GET ROUTE for the book list page -READ OPERATION
router.get('/', tournamentController.displayTournamentList);

/*GET Route for displaying the Add Page- CREATE Operation*/
//router.get('/add', requireAuth,tournamentController.displayAddPage);
router.get('/add', tournamentController.displayAddPage);

/* POST Route for processing the Add Page - CREATE operation*/
//router.post('/add',requireAuth,tournamentController.processAddPage );
router.post('/add',tournamentController.processAddPage);

/*GET Route for displaying the Edit page - UPDATE operation*/
//router.get('/edit/:id', requireAuth,tournamentController.displayEditPage);
router.get('/edit/:id', tournamentController.displayEditPage);

/*POST Route for processing the Edit page - UPDATE Operation*/
//router.post('/edit/:id', requireAuth,tournamentController.processEditPage);
router.post('/edit/:id', tournamentController.processEditPage);

/*GET to perform Deletion - DELETE Operation */
//router.get('/delete/:id', requireAuth,tournamentController.performDelete);
router.get('/delete/:id', tournamentController.performDelete);

/*GET Route for displaying the Details page - UPDATE operation*/
router.get('/details/:id/', tournamentController.displayDetailsPage);

module.exports = router;