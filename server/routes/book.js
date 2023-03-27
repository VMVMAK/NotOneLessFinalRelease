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
//connect to our books model
let Book = require('../models/books');
let bookController = require('../controllers/book');
//GET ROUTE for the book list page -READ OPERATION
router.get('/', bookController.displayBookList);

/*GET Route for displaying the Add Page- CREATE Operation*/
router.get('/add', requireAuth,bookController.displayAddPage);

/* POST Route for processing the Add Page - CREATE operation*/

router.post('/add',requireAuth,bookController.processAddPage );

/*GET Route for displaying the Edit page - UPDATE operation*/

router.get('/edit/:id', requireAuth,bookController.displayEditPage);

/*POST Route for processing the Edit page - UPDATE Operation*/
router.post('/edit/:id', requireAuth,bookController.processEditPage);

/*GET to perform Deletion - DELETE Operation */
router.get('/delete/:id', requireAuth,bookController.performDelete);

module.exports = router;