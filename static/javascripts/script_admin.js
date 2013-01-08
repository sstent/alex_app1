$(document).ready(function() {
    //makes buttons buttons
    $("button").button();


    $("#ExerciseEditorForm").dialog({ autoOpen: false });
    $( "#ExerciseEditorForm" ).dialog( "option", "minHeight", 330 );
    $( "#ExerciseEditorForm" ).dialog( "option", "minWidth", 630 );
    $( "#ExerciseEditorForm" ).dialog({ buttons: [
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
         var newElem = $('<li><label>Name</label><input type="text" name="exercise.name" value=""></li>');
         newElem.append('<li><label>exercise.type</label><select name="exercise.type" ><option value="">Select...</option><option value="Cardio">Cardio</option><option value="Exercise">Weights</option></select></li>');
         // newElem.append('<li><label>exercise.type</label><input type="text" name="exercise.type" value=""></li>');
         newElem.append('<li><label>Muscle Data Array</label><input type="text" name="exercise.muscledata" value=""></li>');
         $(newElem).appendTo('#editexercise');
         $("#ExerciseEditorForm").dialog("open");
        });


    //makes datepickers
    // $( "#datepicker" ).datepicker();
    // $('#Activity').find('input.datepicker').datepicker();
    // $('#Activity').find('input.datepicker').datepicker('setDate', new Date());

     var socket  = io.connect();
     //exercise_autocompletedata = "unset";
     //bike_autocompletedata = "unset";

     //socket.emit('getactivites', 'please');
     socket.emit('getexercises', 'please');
     //socket.emit('getexerciselist', 'cardio');
     //socket.emit('getexerciselist', 'weights');

     // socket.on('populateactivities', function(json) {
     //     console.log('#poulate recieved');
     //     var content = "";
     //     $(".workoutdata").hide();
     //     $('#ActivityList').empty();
     //     $( "#ActivityList" ).html(
     //         $( "#movieTemplate1" ).render( json )
     //        );
     //     $(".ui-accordion-content").css("display", "block");
     //     // $("#ActivityList").accordion('destroy').accordion({
     //     // header: 'h3',
     //     // active: false,
     //     // collapsible: true
     //     // });
     // });
            //poulate activity by id


 socket.on('populateexercisebyid', function(array) {
        // clear it first
        $('ul#editexercise li').remove();
        $('span.EditExerciseID').removeAttr('docid');

        //set document id
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
            ///// for loop
            var array = json;
            exercise_autocompletedata = array;
                $.each(json, function(index, array) {
                        $( "ul#exercises" ).append('<li><label>Exercise Name</label> '+ array.exercise.name + '<label>Exercise Name</label>'+ array.exercise.type + '<label>Muscle Data</label>'+ array.exercise.muscledata + '<a  href=# class="exercisedelete" title="' + array._id +'" >Delete</a><a  href=# class="exerciseedit" title="' + array._id +'" >Edit</a></li>');
                })
            ;
    });

    // //THe Sortable Stuff
    //   $("#sortable").sortable({
    //     placeholder: "ui-state-highlight",
    //     revert: true,
    //     stop: function(event, ui) {
    //         $('#sortable').trigger('sortupdate');
    //     }

    // });

    // $("#sortable").bind('sortupdate', function(event, ui) {
    //     $('#sortable li').each(function(){
    //         var itemindex= $(this).index();
    //         $(this).children('label.uiindex').html('Exercise '+ itemindex );
    //         $(this).find('input, select').not('.laptype').each(function(){
    //             var newname = $(this).attr('name').replace(/\[[0-9]*\]/,'[' + itemindex  + ']');
    //             $(this).attr("name",newname);
    //         });
    //         $(this).find('input.exertags').autocomplete({source: exercise_autocompletedata});
    //     });
    // });


    // $("#sortableexercises").bind('sortupdate', function(event, ui) {
    //     $('#sortableexercises li').each(function(){
    //         var itemindex= $(this).index();
    //         $(this).find('input, select').each(function(){
    //             var newname = $(this).attr('name').replace(/\[[0-9]*\]/,'[' + itemindex  + ']');
    //             $(this).attr("name",newname);
    //         });
    //     });
    // });

    // $('#ActivityList').delegate('a.activitydelete', 'click', function() {
    //              socket.emit('delactivity', $(this).attr('title'));
    //              return false;
    // });

    // $('#ActivityList').delegate('a.activityedit', 'click', function() {
    //              socket.emit('getactivitybyid', $(this).attr('title'));
    //              $("#Activity").dialog("open");
    //              return false;
    // });

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



    // $('ul').on('click', '.delete',function() {
    //       $(this).closest('li').remove();
    //       $('#sortable').trigger('sortupdate');
    // });

    //adds selectable element
    // $("button").click(function() {
    //         var addtype = $(this).attr('value');
    //         var newElem = $('.new-' + addtype).clone(true).attr('style', 'display: block');
    //             $(newElem).removeClass("new-" + addtype);
    //             $(newElem).children('input').attr('disabled',false);
    //             $(newElem).appendTo('#sortable');
    //             $(newElem).sortable( "refresh" );


    //         //$('#sortable').trigger('sortupdate');
    //         //$('#sortableexercises').trigger('sortupdate');
    // });

    // $("button.AddExercise").click(function() {
    //         $( "ul#sortableexercises" ).append('<li class=ui-state-default><input type="text" name="exercise[].name" hint="Name" placeholder="Exercise Name"><input type="text" name="exercise[].class" placeholder="cardio or weights"><input class="addexercisemusclearray" type="text" name="exercise[].muscledata" hint="Muscle Array" placeholder="Muscle Array"><a href=# class=delete>delete</a></li>')
    //    $('#sortableexercises').trigger('sortupdate');
    //    });


    // $('#save').click(function() {
    //          var docid =$(this).closest('span').attr('docid');
    //          var selector= "#myForm"
    //          var formDataAll = $(selector).toObject({mode: 'all'});
    //          socket.emit('addactivity', formDataAll[0], docid);
    //          $('ul#sortable li').remove('.removable');
    //          $('#Activity').find('input').attr('value','');
    //          $('span.ActivityID').removeAttr('docid');
    //          $('#Activity').find('input.datepicker').datepicker();
    //          $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
    //          socket.emit('getactivites', 'please');
    //          socket.emit('getexercises', 'please');
    //          return false;

    // });

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
                 //$('ul#newexercises').find('input').attr('value','');
                 //$('ul#newexercises').find('select').attr('selected','');
                 //socket.emit('getactivites', 'please');
                 return false;
    });


    //  $('#cancelform').click(function() {
    //              $('ul#sortable li').remove('.removable');
    //              $('span.ActivityID').removeAttr('docid');
    //              $('#Activity').find('input').attr('value','');
    //              $('#Activity').find('input.datepicker').datepicker();
    //              $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
    //              socket.emit('getactivites', 'please');
    //              socket.emit('getexercises', 'please');
    //              return false;
    // });

    $('#cancelexerciseform').click(function(){
                 //$('ul#editexercise li').remove();
                 $('#editexercise li').children('input').attr('value','');
                 $('span.EditExerciseID').removeAttr('docid');
                 socket.emit('getexercises', 'please');
                 //return false;
             });

//document closing
});

