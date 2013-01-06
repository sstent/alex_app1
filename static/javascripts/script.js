            $(document).ready(function() {
                 var socket  = io.connect();
                 exercise_autocompletedata = "unset";
                 bike_autocompletedata = "unset";
                 
                 socket.emit('getactivites', 'please');
                 socket.emit('getexercises', 'please');
                 // socket.emit('getexpresso', 'please');
                 
                 
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
                     //set document id
                     $('span.ActivityID').attr('docid',json._id);
                     //poulate name
                        $('input[name="Activities.Activity.name"]').attr('value', json.Activities.Activity.name)
                        //poulate date
                        $('input[name="Activities.Activity.date"]').attr('value', json.Activities.Activity.date)
                       // Activities.Activity.date
                     // for each lap
                     if ("Lap" in json.Activities.Activity) {
                     var array = json.Activities.Activity.Lap;
                        $.each(array, function(index, value) {
                        ////if cardio
                        if ("cardio" in value) { 
                            //get exercise muscledata
                            var lapmuscledata = exercise_autocompletedata[value.cardio.selection].muscledata.value;
                            AddPopulatedLap("Cardio", value.cardio.name, value.cardio.time, value.cardio.distance, "", "" , "", lapmuscledata)

                        };
                        ////if exercise
                        if ("exercise" in value) { 
                            //get exercise muscledata
                            console.log("selction = " + value.exercise.selection);
                            var lapmuscledata = exercise_autocompletedata[value.exercise.selection].muscledata.value;
                            AddPopulatedLap("Exercise", value.exercise.name, "", "", value.exercise.sets, value.exercise.reps , value.exercise.weight , lapmuscledata)
                        };
                        }); 
                   
                   };
                        $('#savecopy').attr('style', 'display: block');
                        ///refresh tabvle
                        $('#sortable').trigger('sortupdate');   
                        
                        //switch to tab
                        $( "#tabs" ).tabs( "select" , 1 )
                        
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
                   };
                       
            //var addtype = $(this).attr('value');
            //var newElem = $('.new-' + addtype).clone(true).attr('style', 'display: block');
            //$(newElem).removeClass("new-" + addtype);
            //$(newElem).children('input').attr('disabled',false);
            //$(newElem).appendTo('#sortable');
            //$(newElem).sortable( "refresh" );
            //$('#sortable').trigger('sortupdate');   

            ////populate exercise sortable
                 socket.on('populateexercises', function(json) {
                     //console.log('#exercises recieved' + JSON.stringify(json, null, '	'));
                     var content = "";
                    $('ul#sortableexercises li').remove();
                    $('span.ExerciseID').attr('docid',json[0]._id);
                    //$( "ul#sortableexercises" ).append('<li style="display: none"><input type="text" name="_id" value="'+ json[0]._id + '"></li>')
                    ///// for loop
                    var array = json[0].exercise;
                    exercise_autocompletedata = array;
                    $('#sortable').trigger('sortupdate');  
                    $.each(array, function(index, value) {
                    $( "ul#sortableexercises" ).append('<li class=ui-state-default><input type="text" name="exercise[].name" value="'+ value.name + '"><input type="text" name="exercise[].class" value="'+ value.class + '"><input type="text" name="exercise[].muscledata" value="'+ value.muscledata + '"><a href=# class=delete>delete</a></li>');
                    $('#sortableexercises').trigger('sortupdate');
                    });
                   
            ////populate expresso sortable
                 // socket.on('populateexpresso', function(json) {
                 //     //console.log('#tracks recieved' + JSON.stringify(json, null, '	'));
                 //     var content = "";
                 //    $('ul#sortableexpresso li').remove();
                 //    $('span.ExpressoID').attr('docid',json[0]._id);
                 //    var barray = json[0].track.name;
                 //    bike_autocompletedata = barray;
                 //    $('#sortable').trigger('sortupdate');  
                 //    $.each(barray, function(index, value) {
                 //    $( "ul#sortableexpresso" ).append('<li class=ui-state-default><input type="text" name="track.name[]" value="'+ value + '"></li>')
                 //   });
                 //   });
                    
            });      
                                  
            // //THe TABs stuff
            // $( "#tabs" ).tabs();
            // $( "#tabs" ).tabs('select' , 0);
            //sets buttons to be jquery buttons
            $("button").button();
            //sets datepickers
            $( "#datepicker" ).datepicker();


            $( "#tabs" ).bind( "tabsselect", function(event, ui) {
                    if (ui.index == 0) { 
                    console.log('send stuff ' + ui.index );
                    socket.emit('getactivites', 'please');
                    };
                    if (ui.index == 2) { 
                    console.log('send stuff ' + ui.index );
                    socket.emit('getexercises', 'please');
                    };                   
            });
                         
            $('#ActivityList').delegate('a.activitydelete', 'click', function() {   
                         socket.emit('delactivity', $(this).attr('title'));             
                         return false;
            });

            $('#ActivityList').delegate('a.activityedit', 'click', function() {   
                         socket.emit('getactivitybyid', $(this).attr('title'));             
                         return false;
            });             
                         
            //THe Sortable Stuff             
              $("#sortable").sortable({
                placeholder: "ui-state-highlight",
                revert: true,
                stop: function(event, ui) {
                    $('#sortable').trigger('sortupdate')
                },

            });                                

            $("#sortable").bind('sortupdate', function(event, ui) {


                        $('#sortable li').each(function(){
                            var itemindex= $(this).index()
                            $(this).children('label.uiindex').html('Exercise '+ itemindex );
                            $(this).find('input').each(function(){
                                var newname = $(this).attr('name').replace(/\[[0-9]*\]/,'[' + itemindex  + ']');
                                $(this).attr("name",newname);
                            });
                            

                            $(this).find('input.exertags').autocomplete({source: exercise_autocompletedata});
                        });
            });

            $("#sortableexercises").sortable({
                    placeholder: "ui-state-highlight",
                    revert: true,
                });

            $("#sortableexercises").bind('sortupdate', function(event, ui) {
                        $('#sortableexercises li').each(function(){
                            var itemindex= $(this).index()
                            $(this).find('input, select').each(function(){
                                var newname = $(this).attr('name').replace(/\[[0-9]*\]/,'[' + itemindex  + ']');
                                console.log('newname' + newname );
                                $(this).attr("name",newname);
                            });
                        });
            });


            $('ul').on('click', '.delete',function() {
                      $(this).closest('li').remove();
                      $('#sortable').trigger('sortupdate')
                      // $('#sortableexercises').trigger('sortupdate')
            });

            ///All the Buttons
            $("button").button(); 
              
            //adds selectable element
            $("button").click(function() { 
                    var addtype = $(this).attr('value');
                    var newElem = $('.new-' + addtype).clone(true).attr('style', 'display: block');
                        $(newElem).removeClass("new-" + addtype);
                        $(newElem).children('input').attr('disabled',false);
                        $(newElem).appendTo('#sortable');
                    $(newElem).sortable( "refresh" );


                    $('#sortable').trigger('sortupdate');
                    //$('#sortableexercises').trigger('sortupdate');
            });

            $("button.AddExercise").click(function() { 
                    $( "ul#sortableexercises" ).append('<li class=ui-state-default><input type="text" name="exercise[].name" hint="Name" placeholder="Exercise Name"><input type="text" name="exercise[].class" placeholder="cardio or weights"><input type="text" name="exercise[].muscledata" hint="Muscle Array" placeholder="Muscle Array"><a href=# class=delete>delete</a></li>')
               $('#sortableexercises').trigger('sortupdate'); 
                });

            $("button.AddExpresso").click(function() { 
                    $( "ul#sortableexpresso" ).append('<li class=ui-state-default><input type="text" name="track.name[]" hint="Name" placeholder="Track Name"><input type="text" name="track.distance[]" hint="Name" placeholder="Distance"><input type="text" name="track.peak[]" hint="Name" placeholder="Peak"></li>')
                });

            $('#Activity').find('input.datepicker').datepicker();
            $('#Activity').find('input.datepicker').datepicker('setDate', new Date());               
                  
                         
                         
            $('#save').click(function() {
                     var docid =$(this).closest('span').attr('docid');
                     var selector= "#myForm"
                     var formDataAll = $(selector).toObject({mode: 'all'});
                     socket.emit('addactivity', formDataAll[0], docid);
                //console.log('All ', JSON.stringify(formDataAll[0], null, '	'));
                     $('ul#sortable li').remove('.removable');
                     $('#Activity').find('input').attr('value','');
                     $('span.ActivityID').removeAttr('docid');
                     $('#savecopy').attr('style', 'display: none');
                     $( "#tabs" ).tabs( "select" , 0 )
                     $('#Activity').find('input.datepicker').datepicker();
                     $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
                     socket.emit('getactivites', 'please');
                     socket.emit('getexercises', 'please');
                     return false;

            });
                  
            $('#savecopy').click(function() {
                 var selector= "#myForm"
                 var formDataAll = $(selector).toObject({mode: 'all'});
                 socket.emit('addactivity', formDataAll[0]);
                //console.log('All ', JSON.stringify(formDataAll[0], null, '	'));
                 $('ul#sortable li').remove('.removable');
                 $('#Activity').find('input').attr('value','');
                 $('span.ActivityID').removeAttr('docid');
                 $('#savecopy').attr('style', 'display: none');
                 $( "#tabs" ).tabs( "select" , 0 )
                 $('#Activity').find('input.datepicker').datepicker();
                 $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
                 return false;
            });

              $('#saveexercises').click(function() {
                         var docid =$(this).closest('span').attr('docid');
                         var selector= "#ExerciseForm"
                         var formDataAll = $(selector).toObject({mode: 'all'});
                         socket.emit('updateexercises', formDataAll[0], docid);
                         
                         //console.log('All ', JSON.stringify(formDataAll, null, '	'));
                               // to prevent the page from changing
                         $('ul#sortableexercises li').remove();
                         $( "#tabs" ).tabs( "select" , 0 )
                          socket.emit('getactivites', 'please');
                          socket.emit('getexercises', 'please');
                         return false;
            });
              
            $('#saveexpresso').click(function() {
                         var docid =$(this).closest('span').attr('docid');
                         var selector= "#ExpressoForm"
                         var formDataAll = $(selector).toObject({mode: 'all'});
                         socket.emit('updateexpresso', formDataAll[0], docid);
                         
                         console.log('All ', JSON.stringify(formDataAll, null, '	'));
                               // to prevent the page from changing
                         $('ul#sortableexpresso li').remove();
                         $( "#tabs" ).tabs( "select" , 0 )
                         return false;
            });

              
             $('#cancelform').click(function() {
                         $('ul#sortable li').remove('.removable');
                         $('span.ActivityID').removeAttr('docid');
                         $('#Activity').find('input').attr('value','');
                         $('#Activity').find('input.datepicker').datepicker();
                         $('#Activity').find('input.datepicker').datepicker('setDate', new Date());
                         return false;
                         socket.emit('getactivites', 'please');
                         socket.emit('getexercises', 'please');
            });
                  
             $('#my-text-link').click(function() { // bind click event to link
                $tabs.tabs('select', 2); // switch to third tab
                return false;
            });
             
             
            $('ul').on('change', '.laptype',function() {
                   console.log ('value= ' + $(this).val() );
                   var currentselect;
                   switch($(this).val()) {
                        case "Cardio":
                            $(this).siblings('span').html('<select class="ExerciseDropDownCardio" name="Activities.Activity.Lap[0].cardio.selection"></select><input type="text" class="lapdistance" name="Activities.Activity.Lap[0].cardio.distance" placeholder="Distance"><input type="text" class="laptime"  name="Activities.Activity.Lap[0].cardio.time" placeholder="hh:mm:ss"><a href=# class=delete>delete</a>');
                                $(exercise_autocompletedata).each(function(index)
                                 {
                                     var option = $('<option />');
                                     if (this.class == 'cardio') { 
                                          option.attr('value', index).text(this.name);
                                          $('.ExerciseDropDownCardio').append(option);
                                        };
                                 });

                            break;
                        case "Exercise":
                            $(this).siblings('span').html('<select class="ExerciseDropDown" name="Activities.Activity.Lap[0].exercise.selection"></select> <input type="text" class="sets" name="Activities.Activity.Lap[0].exercise.sets" placeholder="Sets"><input type="text" class="reps" name="Activities.Activity.Lap[0].exercise.reps" placeholder="Reps"><input type="text" name="Activities.Activity.Lap[0].exercise.weight" class="weight" placeholder="Weight in KG"><a href=# class=delete>delete</a>');
                                $(exercise_autocompletedata).each(function(index)
                                 {
                                     //console.log(this.name);
                                     //console.log(this.muscledata);
                                     console.log("resetingdropdown")
                                      var option = $('<option />');
                                        if (this.class == 'weights') { 
                                          option.attr('value', index).text(this.name);
                                          $('.ExerciseDropDown').append(option);
                                        };
                                 });
                            break;
                    };
                $('#sortable').trigger('sortupdate')
            });



        });
      
