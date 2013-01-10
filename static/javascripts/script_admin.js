$(document).ready(function() {
    //makes buttons buttons
    $("button").button();
     var socket  = io.connect();
     socket.emit('getexercises', 'please');


    $("#ExerciseEditorForm").dialog({ autoOpen: false });
    $("#ExerciseEditorForm").dialog( "option", "minHeight", 330 );
    $("#ExerciseEditorForm").dialog( "option", "minWidth", 630 );
    $("#ExerciseEditorForm").dialog({ buttons: [
         {
             text: "Close/Cancel",
             click: function() {
                 $('#editexercise li').children('input').attr('value','');
                 $('span.EditExerciseID').removeAttr('docid');
                 socket.emit('getexercises', 'please');
                 $(this).dialog("close"); }
         }
         ]
     });

     $("button#addexerciseformopen").click(function() {
//         socket.emit('getexercises', 'please');
         $('ul#editexercise li').remove();
         $('span.EditExerciseID').removeAttr('docid');
         var newElem = $('<li><label class="nofloat">Name</label><input type="text" name="exercise.name" value=""></li>');
         newElem.append('<li><label class="nofloat">exercise.type</label><select name="exercise.type" ><option value="">Select...</option><option value="Cardio">Cardio</option><option value="Exercise">Weights</option></select></li>');
         newElem.append('<li><label class="nofloat">Muscle Data Array</label><input type="text" name="exercise.muscledata" value=""></li>');
         $(newElem).appendTo('#editexercise');
         $("#ExerciseEditorForm").dialog("open");
        });

    


    socket.on('populateexercisebyid', function(array) {
        $('ul#editexercise li').remove();
        $('span.EditExerciseID').removeAttr('docid');
        $('span.EditExerciseID').attr('docid',array._id);
        console.log('name= ' + array.exercise.name);
        console.log('class= ' + array.exercise.type);
        console.log('muscledata= ' + array.exercise.muscledata);
        var newElem = $('<li><input type="text" name="exercise.name" value="'+ array.exercise.name + '"><input type="text" name="exercise.type" value="'+ array.exercise.type + '"><input type="text" name="exercise.muscledata" value="'+ array.exercise.muscledata + '"></li>');
        $(newElem).appendTo('#editexercise');
    });


    ////populate exercise tables
     socket.on('populateexercises', function(json) {
        var content = "";
        $('ul#exercises li').remove();
        var array = json;
        exercise_autocompletedata = array;
            $.each(json, function(index, array) {
                    $( "ul#exercises" ).append('<li> Exercice Name - '+ array.exercise.name + ' - Exercise Type - ' + array.exercise.type + ' - Muscle Data - '+ array.exercise.muscledata + '<a  href=# class="exercisedelete" title="' + array._id +'" >Delete</a><a  href=# class="exerciseedit" title="' + array._id +'" >Edit</a></li>');
            })
        ;
    });


    $('#exercises').delegate('a.exercisedelete', 'click', function() {
                 console.log("exercisedelete_click");
                 socket.emit('delexercise', $(this).attr('title'));
                 return false;
    });

    $('#exercises').delegate('a.exerciseedit', 'click', function() {
                 console.log("exerciseedit_click");
                 socket.emit('getexercisebyid', $(this).attr('title'));
                 $("#ExerciseEditorForm").dialog("open");
                 return false;
    });




    $('#saveexercises').click(function() {
         console.log("saving exercise");
         var docid =$(this).closest('span').attr('docid');
         var selector= "#EditExerciseForm";
         var formDataAll = $(selector).toObject({mode: 'all'});
         socket.emit('updateexercises', formDataAll[0], docid);
         //cleanup[]
         $('#editexercise li').children('input').attr('value','');
         $('#editexercise li').children('select').attr('value','');
         $('span.EditExerciseID').removeAttr('docid');
         socket.emit('getexercises', 'please');
         return false;
    });


    $('#cancelexerciseform').click(function(){
         $('#editexercise li').children('input').attr('value','');
         $('span.EditExerciseID').removeAttr('docid');
         socket.emit('getexercises', 'please');
         return false;
     });

//document closing
});

