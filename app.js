
/**
 * Module dependencies.
 */
var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var db = require('mongoskin').db('localhost:27017/test');
var testcollection = db.collection('testcollection');
var exercisecollection = db.collection('exercisecollection');
var util = require('util');
//var parser = new xml2js.Parser();
var dateFormat = require('dateformat');
var waiting = 0;
var waitingj = 0;
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

  // socket.on('getactivites', function(data) {
  //       // console.log('getactivites');
  //       testcollection.find().toArray(function(err, result) {
  //           if (err) throw err;
  //           socket.emit('populateactivities', result);
  //       });
  //   });
  ///////////////////////////////////////////
    socket.on('getactivites', function(data) {
        console.log('getactivities');
        waiting = 0;
        testcollection.find().toArray(function(err, result) {
            if (err) throw err;
                    for (j in result) {
                        console.log('getactivities' + JSON.stringify(result));
                        var eresult = result;               
                        var i;
                        waitingj ++;
                        for(i in result[j].Activities.Activity.Lap) {
                                //////////////
                                waiting ++;
                                getbyidall(eresult,result[j].Activities.Activity.Lap[i].selection,i,j);
                                //////////////////// 
                                console.log('below_i  = ' + i);
                                //console.log('DATA  = ' + JSON.stringify(callback));               
                            };
                    };  
        });
    });
////////////////////////////////////////
function deiteratej() {
    if (!waiting) {
    waitingj --;   
    }
}
function completeall(result) {
    if (!waiting) {
        console.log('done');
        socket.emit('populateactivities', result);     
    }
}
function complete(result) {
    if (!waiting) {
        console.log('done');
        socket.emit('populateactivitybyid', result);     
    }
}
function getbyidall (result,docid,iteration,iterationtop){
                           exercisecollection.findById(docid, function(err, exresult) {
                                    if (err) throw err;
                                    waiting --;
                                    console.log('waiting  = ' + waiting);
                                    console.log('inside_j  = ' + iterationtop)
                                    console.log('inside_i  = ' + iteration);
                                    result[iterationtop].Activities.Activity.Lap[iteration].exercisename = exresult.exercise.name;
                                    result[iterationtop].Activities.Activity.Lap[iteration].exercisemuscledata = exresult.exercise.muscledata;
                                    result[iterationtop].Activities.Activity.Lap[iteration].exerciseclass = exresult.exercise.class;
                                    deiteratej();
                                    completeall(result);

                                 });
};
function getbyid (result,docid,iteration){
                           exercisecollection.findById(docid, function(err, exresult) {
                                    if (err) throw err;
                                    waiting --;
                                    console.log('waiting  = ' + waiting);
                                    console.log('inside_i  = ' + iteration);
                                    result.Activities.Activity.Lap[iteration].exercisename = exresult.exercise.name;
                                    result.Activities.Activity.Lap[iteration].exercisemuscledata = exresult.exercise.muscledata;
                                    result.Activities.Activity.Lap[iteration].exerciseclass = exresult.exercise.class;
                                    complete(result);
                                 });
};

///////////////////////////////////////
  socket.on('getactivitybyid', function(id) {
        waiting = 0;
        testcollection.findById(id, function(err, result) {
            if (err) throw err;
                    //console.log('Activity result  = ' + JSON.stringify(result));
                    //var unpackedresult = JSON.parse(result);
                    var eresult = result;
                    
                    var i;
                    for(i in result.Activities.Activity.Lap) {
                        //console.log('Activity parse result  = ' + JSON.stringify(item.val1));
                            console.log('above_i  = ' + i);
                            ///////////////
                            waiting ++;
                            getbyid(eresult,result.Activities.Activity.Lap[i].selection,i);

                            //////////////////// 
                            console.log('below_i  = ' + i);
                            //console.log('DATA  = ' + JSON.stringify(callback));               
                        };
            
            
                         
        });
    });
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
                       waiting = 0;
                        testcollection.find().toArray(function(err, result) {
                            if (err) throw err;
                                    for (j in result) {
                                        console.log('getactivities' + JSON.stringify(result));
                                        var eresult = result;               
                                        var i;
                                        waitingj ++;
                                        for(i in result[j].Activities.Activity.Lap) {
                                                //////////////
                                                waiting ++;
                                                getbyidall(eresult,result[j].Activities.Activity.Lap[i].selection,i,j);
                                                //////////////////// 
                                                console.log('below_i  = ' + i);
                                                //console.log('DATA  = ' + JSON.stringify(callback));               
                                            };
                                    };  
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



