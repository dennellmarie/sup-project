var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var jsonParser = bodyParser.json();

var User = require('./models/user');
var Message = require('./models/message');

// Add your API endpoints here

//users
app.get('/users', function(req, res) {
    User.find(function(err, users) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Errror'});
        }
        res.json(users);
    });
});

app.post('/users', jsonParser, function(req, res) {
    if (req.body.username) {
        if (typeof(req.body.username) === 'string') {
            User.create({username: req.body.username}, function(err, users) {
                if (err) {
                    return res.status(500).json({message: 'Internal Server Errror'});
                }
                res.status(201).set('location', `/users/${users._id}`).json({});
            });
        } else {
            res.status(422).json({message: 'Incorrect field type: username'});
        }
    } else {
        res.status(422).json({message: 'Missing field: username'});
    }
});

app.get('/users/:userId', function(req, res) {
    User.findOne({_id: req.params.userId}, function(err, user) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Errror'});
        } else if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({message: 'User not found'});
        }
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    if (req.body.username) {
        if (typeof(req.body.username) === 'string') {
            User.findOneAndUpdate({_id: req.params.userId}, {username: req.body.username}, {upsert: true, new: true}, function(err, user) {
                if (err) {
                    return res.status(500).json({message: 'Internal Server Errror'});
                }
                res.status(200).json({});
            });
        } else {
            res.status(422).json({message: 'Incorrect field type: username'});
        }
    } else {
        res.status(422).json({message: 'Missing field: username'});
    }
});

app.delete('/users/:userId', function(req, res) {
    User.find({_id: req.params.userId}, function(err, user) {
        if(err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        if(user.length > 0) {
            User.remove({_id: req.params.userId}, function(err, confirm) {
                if(err) {
                   return res.status(500).json({message: 'Internal Server Error'}); 
                }
                res.status(200).json({});
            });
        } else {
            res.status(404).json({message: 'User not found'});
        }
    });
});

//messages
app.get('/messages', function(req, res) {
    Message.find(function(err, messages){
        if(err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        var messagesArray = [];
        messages.forEach((message) => {
            var keyValueObject = {};
            console.log("message " + message);
            for(var key in message) {
                keyValueObject[key].text = message.text;
                keyValueObject[key].from = message.from;
                keyValueObject[key].to = message.to;
            }
            messagesArray.push(keyValueObject);
        });
        console.log("messageArray: " + messagesArray);
        res.status(200).json(messagesArray);
    });
});


var runServer = function(callback) {
    var databaseUri = process.env.DATABASE_URI || global.databaseUri || 'mongodb://localhost/sup';
    mongoose.connect(databaseUri).then(function() {
        var port = process.env.PORT || 8080;
        var server = app.listen(port, function() {
            console.log('Listening on localhost:' + port);
            if (callback) {
                callback(server);
            }
        });
    });
};

if (require.main === module) {
    runServer();
};

exports.app = app;
exports.runServer = runServer;

