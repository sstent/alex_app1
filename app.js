
/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
//var mongo = require('mongodb');
var async = require('async');
var mongo = require('mongoskin');
var BSON = mongo.BSONPure;
var db = mongo.db('localhost:27017/test');
var testcollection = db.collection('testcollection');
var exercisecollection = db.collection('exercisecollection');
var util = require('util');
//var extname;
var app = require('http').createServer(function handler(request, response) {


console.log('request starting...;' + request.url);

  switch(request.url) {

     case '/admin':
            filePath = './admin.html';

        extname = path.extname(filePath);
        contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
        }
        path.exists(filePath, function(exists) {

            if (exists) {
                fs.readFile(filePath, function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    }
                });
            }
            else {
                response.writeHead(404);
                response.end();
            }
        });
     break;
    case '/placeholder':
        break;
 //  default case
     default:
        var filePath = '.' + request.url;
        if (filePath == './')
            filePath = './index.html';

        extname = path.extname(filePath);
        contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
        }
        path.exists(filePath, function(exists) {

            if (exists) {
                fs.readFile(filePath, function(error, content) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    }
                });
            }
            else {
                response.writeHead(404);
                response.end();
            }
        });
     }
}).listen(3000);


var io = require('socket.io');
io = io.listen(app);
io.configure('development', function(){
io.set("transports", ["websocket"]);
});

io.sockets.on('connection', function(socket) {
  ///////////////////////////////////////////
    socket.on('getactivites', function(data) {
        console.log('getactivities');
        testcollection.find().toArray(function(err, result) {
            if (err) throw err;
                async.forEachSeries(result, 
                    function(item,callback2) {
                        async.forEachSeries(item.Activities.Activity.Lap, 
                            function(itemx,callback3){
                                exercisecollection.findById(itemx.selection, function(err, exresult) {
                                    if (err) throw err;
                                        itemx.exercisename = exresult.exercise.name;
                                        itemx.exercisemuscledata = exresult.exercise.muscledata;
                                        itemx.exerciseclass = exresult.exercise.type;
                                callback3();
                                });
                    }, function(err){
                        callback2();
                    });                       
                }, function(err){
                    /////////THIS is psuedo code for adding the activity arrays
                    //combinedarray = [0,0,0,0,0,0]
                    // for j in result
                       // do 
                            //for i in (1..6)
                                // do 
                                // combinedarray[i] =  result[j].exercisemuscledata[i] + combinedarray[i]
                            // 
                    // result.combinedarray = combinedarray
                    socket.emit('populateactivities', result); 
                });
        });
});
///////////////////////////////////////
    socket.on('getactivitybyid', function(id) {
        testcollection.findById(id, function(err, result) {
            if (err) throw err;

                                async.forEachSeries(item.Activities.Activity.Lap, 
                                    function(itemx,callback3){
                                        exercisecollection.findById(itemx.selection, function(err, exresult) {
                                            if (err) throw err;
                                                itemx.exercisename = exresult.exercise.name;
                                                itemx.exercisemuscledata = exresult.exercise.muscledata;
                                                itemx.exerciseclass = exresult.exercise.type;
                                        callback3();
                                        });
                            }, function(err){callback2();});

        });
    });
////////////////////////
    socket.on('addactivity', function(data, docid) {
        var document_id;
        if (docid  === null) {
                 document_id = new BSON.ObjectID();
         }
         else {
            document_id = new BSON.ObjectID(docid);
          }
                testcollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
                if (err) throw err;
                         exercisecollection.find().toArray(function(err, result) {
                         if (err) throw err;
                                socket.emit('populateexercises', result);
                         });
                });


    });

/////////////////////
        socket.on('delactivity', function(id) {
            testcollection.removeById(id,function(err, reply){
                if (err) throw err;
                testcollection.find().toArray(function(err, result) {
                    if (err) throw err;
                    socket.emit('populateactivities', result);
            });
        });
    });
 ///////////////////
     socket.on('getexercises', function(data) {
        exercisecollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateexercises', result);
        });
    });
/////////////////////
    socket.on('updateexercises', function(data, docid) {
        if (docid  == 'undefined') {
                exercisecollection.insert(data, function(err, result) {
                if (err) throw err;
                        exercisecollection.find().toArray(function(err, result) {
                        if (err) throw err;
                        socket.emit('populateexercises', result);
                        });
                });
        }
        else {
                var document_id = new BSON.ObjectID(docid);
                exercisecollection.update({_id:document_id}, data,{upsert:true} , function(err, result) {
                if (err) throw err;
                         exercisecollection.find().toArray(function(err, result) {
                         if (err) throw err;
                                socket.emit('populateexercises', result);
                         });
                });
        }
    });
////////////////////
  socket.on('getexercisebyid', function(id) {
        exercisecollection.findById(id, function(err, result) {
            if (err) throw err;
            socket.emit('populateexercisebyid', result);
        });
    });


////////////////
        socket.on('delexercise', function(id) {
            exercisecollection.removeById(id,function(err, reply){
                if (err) throw err;
                exercisecollection.find().toArray(function(err, result) {
                    if (err) throw err;
                    socket.emit('populateexercises', result);
            });
        });
    });
//////////////////
     socket.on('getexerciselist', function(data) {
        exercisecollection.find({'exercise.type': data }).toArray(function(err, result) {
            if (err) throw err;
            console.log('emited exercises  = ' + JSON.stringify(result));
            socket.emit('populateexerciselist', data , result);
        });
    });
/////////////////////
});



