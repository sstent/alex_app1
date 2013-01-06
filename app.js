
/**
 * Module dependencies.
 */
var eresult;
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var async = require('async');
var BSON = mongo.BSONPure;
var db = require('mongoskin').db('localhost:27017/test');
var testcollection = db.collection('testcollection');
var exercisecollection = db.collection('exercisecollection');
var util = require('util');
//var parser = new xml2js.Parser();
var dateFormat = require('dateformat');

var app = require('http').createServer(function handler(request, response) {

    console.log('request starting...;' + request.url);

  switch(request.url) {
 
     case '/admin':
 
        //var filePath = '.' + request.url;
        //if (filePath == './')
            filePath = './admin.html';

        var extname = path.extname(filePath);
        var contentType = 'text/html';
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
 //  default case
     default:
        var filePath = '.' + request.url;
        if (filePath == './')
            filePath = './index.html';

        var extname = path.extname(filePath);
        var contentType = 'text/html';
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
    // console.log('Client connected');

  socket.on('getactivites', function(data) {
        // console.log('getactivites');
        testcollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateactivities', result);
        });
    });
///////////////////////////////////////
  socket.on('getactivitybyid', function(id) {
        // console.log('getactivitybyid');
          
        testcollection.findById(id, function(err, result) {
            if (err) throw err;
                    //console.log('Activity result  = ' + JSON.stringify(result));
                    //var unpackedresult = JSON.parse(result);
                    eresult= result;
                    // var i;
                    for(i in result.Activities.Activity.Lap) {
                        //console.log('Activity parse result  = ' + JSON.stringify(item.val1));
                            console.log('above_i  = ' + i);
                            ///////////////
                            getdoc(result.Activities.Activity.Lap[i].selection, i, function(docdata, iteration) {
                            console.log(docdata);
                            eresult.Activities.Activity.Lap[iteration].execisename = docdata.exercise.name
                            eresult.Activities.Activity.Lap[iteration].execiseclass = docdata.exercise.class
                            eresult.Activities.Activity.Lap[iteration].execisemuscledata = docdata.exercise.muscledata

                            if (iteration == result.Activities.Activity.Lap.length-1)
                            {
                             // console.log('fnal round' + iteration);  
                             socket.emit('populateactivitybyid', result); 
                            }
                            
                            });

                            //////////////////// 
                            console.log('below_i  = ' + i);
                            //console.log('DATA  = ' + JSON.stringify(callback));               
                        };
            
                         
        });
    });

function getdoc(docid, iteration, callback) {
  exercisecollection.findById(docid, function(err, exresult) {
    if (err) throw err;

   console.log('docid  = ' + docid);
   console.log('inside_i  = ' + iteration);
   callback(exresult, iteration);
  });

}
                            

////////////////////////
    socket.on('addactivity', function(data, docid) {
        // console.log('addactivity' + docid);
        // console.log('add_activity_data' + JSON.stringify(data));
        if (docid  === null) {
                 var document_id = new BSON.ObjectID();
         }
         else {
            var document_id = new BSON.ObjectID(docid);
          }
                //var document_id = new BSON.ObjectID(docid);
                // console.log('inserted BSONID' + document_id);
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
     // console.log('emit exercises');
        exercisecollection.find().toArray(function(err, result) {
            if (err) throw err;
            socket.emit('populateexercises', result);
        });
    });
/////////////////////
    socket.on('updateexercises', function(data, docid) {
        // console.log('updateexecises' + JSON.stringify(data));
        if (docid  == 'undefined') {
                //console.log('edited updateexecises' + JSON.stringify(data));
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
                             //console.log('populateexercises');
                                socket.emit('populateexercises', result);
                         });
                });

        }
    });
////////////////////
  socket.on('getexercisebyid', function(id) {
        // console.log('getexercisebyid');
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
 ///////////////////
     socket.on('getexerciselist', function(data) {
     // console.log('emit exercises  = ' + data);
        exercisecollection.find({'exercise.class': data }).toArray(function(err, result) {
            if (err) throw err;
            //console.log('emited exercises  = ' + JSON.stringify(result));
            socket.emit('populateexerciselist', data , result);
        });
    });
/////////////////////
});



