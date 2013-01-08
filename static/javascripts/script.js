$(document).ready(function() {
    //makes buttons buttons
    $("button").button();

// $("#Activity").dialog({ autoOpen: false });
//    $( "#Activity" ).dialog( "option", "minHeight", 330 );
//    $( "#Activity" ).dialog( "option", "minWidth", 730 );
//    $( "#Activity" ).dialog({ buttons: [
//         {
//             text: "Close/Cancel",
//             click: function() { $(this).dialog("close"); }
//         }
//         ]
//     });

//     $("button#openactivities").click(function() {
// //
//         $("#Activity").dialog("open");
//        });



    //makes datepickers
    $( "#datepicker" ).datepicker();
    $('#Activity').find('input.datepicker').datepicker();
    $('#Activity').find('input.datepicker').datepicker('setDate', new Date());

     var socket  = io.connect();
     //exercise_autocompletedata = "unset";
     //bike_autocompletedata = "unset";

     //get intial data
     socket.emit('getactivites', 'please');
     //socket.emit('getexercises', 'please');
     socket.emit('getexerciselist', 'Cardio');
     socket.emit('getexerciselist', 'Exercise');

     socket.on('populateactivities', function(json) {
         console.log('#poulate recieved');
         var content = "";
         $(".workoutdata").hide();
         $('#ActivityList').empty();
         $( "#ActivityList" ).html(
             $( "#movieTemplate1" ).render( json )
            );
         $(".ui-accordion-content").css("display", "block");
         // $("#ActivityList").accordion('destroy').accordion({
         // header: 'h3',
         // active: false,
         // collapsible: true
         // });
     });


            //poulate activity by id
    socket.on('populateactivitybyid', function(json) {
        // clear it first
        $('ul#sortable li').remove('.removable');
        $('span.ActivityID').removeAttr('docid');
        $('#Activity').find('input').attr('value','');
        $('#Activity').find('input.datepicker').datepicker();
        $('#Activity').find('input.datepicker').datepicker('setDate', new Date());

     //set document id
        $('span.ActivityID').attr('docid',json._id);
     //poulate name
       // $('input[name="Activities.Activity.name"]').attr('value', json.Activities.Activity.name)
     //poulate date
        $('input[name="Activities.Activity.date"]').attr('value', json.Activities.Activity.date);
     // Activities.Activity.date
     // for each lap
         if ("Lap" in json.Activities.Activity) {
         var array = json.Activities.Activity.Lap;
            $.each(array, function(index, value) {
        ////if cardio
            if (value.type == "Cardio" ) {
                //get exercise muscledata
                AddPopulatedLap("Cardio", value.name, value.time, value.distance, "", "" , "", value.exercisemuscledata);
            }
        ////if exercise
            if (value.type == "Exercise" ) {
                //get exercise muscledata
                console.log("selction = " + value.selection);
                AddPopulatedLap("Exercise", value.name, "", "", value.sets, value.reps , value.weight , value.exercisemuscledata);
            }
            });
        }
        ///refresh table
        $('#sortable').trigger('sortupdate');

    });


    function AddPopulatedLap(type, name, time, distance, sets, reps, weight, muscledata) {
            console.log('type= ' + type);
            console.log('muscledata= ' + muscledata);
            var newElem = $('.new-lap').clone(true).attr('style', 'display: block');
            $(newElem).removeClass('new-lap');
            $(newElem).appendTo('#sortable');
            $(newElem).children('.laptype').val(type).trigger('change');
            $(newElem).children('input').attr('disabled',false);
            $(newElem).find('.lapname').attr('value', name);
            $(newElem).find('.lapdistance').attr('value', distance);
            $(newElem).find('.laptime').attr('value', time);
            $(newElem).find('.sets').attr('value', sets);
            $(newElem).find('.reps').attr('value', reps);
            $(newElem).find('.weight').attr('value', weight);
            $(newElem).find('.muscledata').attr('value', muscledata);
            $(newElem).sortable( "refresh" );
           }

      socket.on('populateexerciselist', function(data, result) {
         if ("Cardio" == data) {
            //create cardiodropdownlist
            $( ".ExerciseDropDownCardio" ).remove('option');
            $.each(result, function(index, array) {
                        $( ".ExerciseDropDownCardio" ).append('<option value="' + array._id +'" > '+ array.exercise.name +'</option>');
                });
            }
         if ("Exercise" == data) {
            $( ".ExerciseDropDownWeights" ).remove('option');
            $.each(result, function(index, array) {
                        $( ".ExerciseDropDownWeights" ).append('<option value="' + array._id +'" > '+ array.exercise.name +'</option>');
                });
            }

        });


    //THe Sortable Stuff
      $("#sortable").sortable({
        placeholder: "ui-state-highlight",
        revert: true,
        stop: function(event, ui) {
            $('#sortable').trigger('sortupdate');
        }

    });

    $("#sortable").bind('sortupdate', function(event, ui) {
        $('#sortable li').each(function(){
            var itemindex= $(this).index();
            $(this).children('label.uiindex').html('Exercise '+ itemindex );
            $(this).find('input, select').each(function(){
                var newname = $(this).attr('name').replace(/\[[0-9]*\]/,'[' + itemindex  + ']');
                $(this).attr("name",newname);
            });
            //$(this).find('input.exertags').autocomplete({source: exercise_autocompletedata});
        });
    });


    $('#ActivityList').delegate('a.activitydelete', 'click', function() {
                 socket.emit('delactivity', $(this).attr('title'));
                 return false;
    });

    $('#ActivityList').delegate('a.activityedit', 'click', function() {
                 socket.emit('getactivitybyid', $(this).attr('title'));
                 $("#Activity").dialog("open");
                 return false;
    });


    // $('ul').on('click', '.delete',function() {
    //       $(this).closest('li').remove();
    //       $('#sortable').trigger('sortupdate')
    // });

    //adds selectable element
    $("button").click(function() {
            var addtype = $(this).attr('value');
            var newElem = $('.new-' + addtype).clone(true).attr('style', 'display: block');
                $(newElem).removeClass("new-" + addtype);
                $(newElem).children('input').attr('disabled',false);
                $(newElem).appendTo('#sortable');
            $(newElem).sortable( "refresh" );
            $('#sortable').trigger('sortupdate');
    });



    $('#save').click(function() {
             var docid =$(this).closest('span').attr('docid');
             var selector= "#myForm";
             var formDataAll = $(selector).toObject({mode: 'all'});
             socket.emit('addactivity', formDataAll[0], docid);
             $('ul#sortable li').remove('.removable');
             $('#Activity').find('input').attr('value','');
             $('span.ActivityID').removeAttr('docid');
             $('#Activity').find('input.datepicker').datepicker();
             $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
             socket.emit('getactivites', 'please');
             socket.emit('getexercises', 'please');
             return false;

    });


     $('#cancelform').click(function() {
                 $('ul#sortable li').remove('.removable');
                 $('span.ActivityID').removeAttr('docid');
                 $('#Activity').find('input').attr('value','');
                 $('#Activity').find('input.datepicker').datepicker();
                 $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
                 socket.emit('getactivites', 'please');
                 socket.emit('getexercises', 'please');
                 return false;
    });


    $('ul').on('change', '.laptype',function() {
           console.log ('value= ' + $(this).val() );
           var currentselect;
           switch($(this).val()) {
                case "Cardio":
                    $(this).siblings('span').html('<select class="ExerciseDropDownCardio" name="Activities.Activity.Lap[0].selection"></select><input type="text" class="lapdistance" name="Activities.Activity.Lap[0].distance" placeholder="Distance"><input type="text" class="laptime"  name="Activities.Activity.Lap[0].time" placeholder="hh:mm:ss"><input style="display: none" type=text class="muscledata" name="Activities.Activity.Lap[0].muscledata"><a href=# class=delete>delete</a>');

                         socket.emit('getexerciselist', 'Cardio');

                    break;
                case "Exercise":
                    $(this).siblings('span').html('<select class="ExerciseDropDownWeights" name="Activities.Activity.Lap[0].selection"></select> <input type="text" class="sets" name="Activities.Activity.Lap[0].sets" placeholder="Sets"><input type="text" class="reps" name="Activities.Activity.Lap[0].reps" placeholder="Reps"><input type="text" name="Activities.Activity.Lap[0].weight" class="weight" placeholder="Weight in KG"><input style="display: none" type=text class="muscledata" name="Activities.Activity.Lap[0].muscledata"><a href=# class=delete>delete</a>');
                        socket.emit('getexerciselist', 'Exercise');
                    break;
            }
        $('#sortable').trigger('sortupdate');
    });

//document closing
});

