var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
 var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

 var led1 = new Gpio(4, 'out'); //use GPIO pin 4 as output
 var led2 = new Gpio(5, 'out'); //use GPIO pin 5 as output
 var led3 = new Gpio(27, 'out'); //use GPIO pin 27 as output
 var led4 = new Gpio(6, 'out'); //use GPIO pin 6 as output - PIN 31
 var pushButton1 = new Gpio(18, 'in', 'falling', {debounceTimeout: 3}); //use GPIO pin 18 as input, and 'both' button presses, and releases should be handled
 var pushButton2 = new Gpio(23, 'in', 'falling', {debounceTimeout: 3}); //use GPIO pin 23 as input, and 'both' button presses, and releases should be handled
 var pushButton3 = new Gpio(24, 'in', 'falling', {debounceTimeout: 3}); //use GPIO pin 24 as input, and 'both' button presses, and releases should be handled
 var pushButton4 = new Gpio(25, 'in', 'falling', {debounceTimeout: 3}); //use GPIO pin 25 as input, and 'both' button presses, and releases should be handled
 var led = [led1,led2,led3,led4];
 var inputButtons = [pushButton1,pushButton2,pushButton3,pushButton4];
 var status = 0;

 function getRandomInt(min, max) {
   return Math.floor(Math.random() * (max - min)) + min;
 }

app.use(express.static(path.join(__dirname + '/public')));
// viewed at http://localhost:8080
app.get('/', function(req, res) {
    // __dirname es la direccion de server.js

    res.sendFile(path.join(__dirname + '/public/index.html'));
});

http.listen(3000, function(){
  console.log('listening on :3000');
});

//******************************************************************************
//******************************************************************************

io.sockets.on('connection', function (socket) {// WebSocket Connection
  console.log('Conexion iniciada');
//******************************************************************************
//******************************************************************************

  function changeState(led_select,value) {
    if (led_select !== undefined){
    if (value != led_select.readSync()) { //only change LED if status has changed
           led_select.writeSync(value); //turn LED on or off
      }
    }
    else {
      if (value != led[0].readSync()) { //only change LED if status has changed
             led[0].writeSync(value); //turn LED on or off
        }
    }
    return value;
  }

socket.on('Datos', function(tipo,tiempo,reps, modulos, is_secuencial){
  console.log(tipo);
  console.log(tiempo);
  console.log(reps);
  console.log(modulos);
  console.log(is_secuencial);
})

//******************************************************************************
  socket.on('entrenamiento general', function(type,tiempo,repeticiones,modulos,is_secuencial){
    const totalTime = tiempo*1000;
    const noTry = repeticiones;
    const modules = modulos;
    const secuencial = is_secuencial;
    const stepTime = Math.floor(totalTime/noTry);

    if (secuencial === true) //Activacion de estimulos de forma periodica
    {
      var activationTime = [];var desactivationTime = [];var reactionTime = [];var hitmissArray = [];
      var status = 0;
      const deadTime = stepTime - 500; //Tiempo de desactivacion

      for (var i = 0; i < noTry; i++)
      {
        activationTime.push((i+1)*stepTime);
        desactivationTime.push(activationTime[i]+deadTime);
      }
      console.log(activationTime);
      console.log(desactivationTime);

      if (modules > 1)
      {
        var activateModule = [];
        for (var i = 0; i < noTry; i++) {
          activateModule.push(getRandomInt(0,modules));
        }
        console.log(activateModule);

        var timeON = [];var timeOFF = [];
        var currentState = 0;
        var onTime;var reaction;
        for (var i = 0; i < activationTime.length; i++) {
          onSetTimeout(i);
        }
        for (var i = 0; i < desactivationTime.length; i++) {
          offSetTimeout(i);
        }

        function onSetTimeout(i) {
         timeON.push(setTimeout(function () {
            if (i === 0){
              currentState = 0;
            }
            else {
              currentState = currentState + 1;
            }
            console.log('xxx', currentState);
            status = changeState(led[activateModule[i]],1);
            onTime = Date.now();
          },activationTime[i]));
        }

       function offSetTimeout(i) {
         timeOFF.push(setTimeout(function () {
           changeState(led[activateModule[i]],0);
           reactionTime.push('--');
           hitmissArray.push('Miss');
         },desactivationTime[i]));
       }

           setTimeout(function () {
             console.log('Entrenamiento terminado');
             console.log(reactionTime);
             console.log(hitmissArray);
           }, desactivationTime[desactivationTime.length-1]+2000);

           inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 0){
                  status = changeState(led[0],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[1].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 1){
                  status = changeState(led[1],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[2].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 2){
                  status = changeState(led[2],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[3].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 3){
                  status = changeState(led[3],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
      }

      else
      {
        var timeON = [];var timeOFF = [];
        var currentState = 0;
        var onTime;var reaction;
        for (var i = 0; i < activationTime.length; i++) {
          timeON.push(setTimeout(function () {
            currentState = currentState + i;
            status = changeState(led[0],1);
            onTime = Date.now();
          },activationTime[i]));
          timeOFF.push(setTimeout(function () {
            status = changeState(led[0],0);
            reactionTime.push('--');
            hitmissArray.push('Miss');
          },desactivationTime[i]));
        }

        setTimeout(function () {
          console.log('Entrenamiento terminado');
          console.log(reactionTime);
          console.log(hitmissArray);
        }, desactivationTime[desactivationTime.length-1]+2000);

        inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
           if (err) {console.error('There was an error', err); //output error message to console
             return err;
           }
           if (value != status) {
             console.log("xxx", currentState);
             console.log('Cambio de estado');
             clearTimeout(timeOFF[(currentState/10)-1]);
             status = changeState(led[0],0);
             console.log('TimeOFF length', timeOFF.length);
             reaction = Date.now();
             reactionTime.push(reaction-onTime);
             socket.emit('tiempo',reaction-onTime,'Hit');
             hitmissArray.push('Hit');
           }
        });



      }
    }
    else
    {
      var activationTime = [];var desactivationTime = [];var reactionTime = [];var hitmissArray = [];
      var status = 0;


      for (var i = 0; i < noTry; i++) {
        activationTime.push(getRandomInt(0,(stepTime-(stepTime/5)))+(i*stepTime));
        desactivationTime.push((i*stepTime)+stepTime);
      }
      desactivationTime[desactivationTime.length-1]=(totalTime-10); //Se apaga 0.1 segundo antes que termine el entrenamiento
      console.log(activationTime);
      console.log(desactivationTime);

      if (modules > 1){
        var activateModule = [];
        for (var i = 0; i < noTry; i++) {
          activateModule.push(getRandomInt(0,modules));
        }
        console.log(activateModule);

        var timeON = [];var timeOFF = [];
        var currentState = 0;
        var onTime;var reaction;
        for (var i = 0; i < activationTime.length; i++) {
          onSetTimeout(i);
        }
        for (var i = 0; i < desactivationTime.length; i++) {
          offSetTimeout(i);
        }

          function onSetTimeout(i) {
           timeON.push(setTimeout(function () {
              if (i === 0){
                currentState = 0;
              }
              else {
                currentState = currentState + 1;
              }
              console.log('xxx', currentState);
              status = changeState(led[activateModule[i]],1);
              onTime = Date.now();
            },activationTime[i]));
          }

           function offSetTimeout(i) {
             timeOFF.push(setTimeout(function () {
               changeState(led[activateModule[i]],0);
               reactionTime.push('--');
               hitmissArray.push('Miss');
             },desactivationTime[i]));
           }

           setTimeout(function () {
             console.log('Entrenamiento terminado');
             console.log(reactionTime);
             console.log(hitmissArray);
           }, desactivationTime[desactivationTime.length-1]+2000);

           inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 0){
                  status = changeState(led[0],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[1].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 1){
                  status = changeState(led[1],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[2].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 2){
                  status = changeState(led[2],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
           inputButtons[3].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log('Cambio de estado');
                console.log('zzz',currentState);
                if (activateModule[currentState] === 3){
                  status = changeState(led[3],0);
                  clearTimeout(timeOFF[currentState]);
                  reaction = Date.now();
                  reactionTime.push(reaction-onTime);
                  hitmissArray.push('Hit');
                }
                else {
                  status = changeState(led[activateModule[currentState]],0);
                  clearTimeout(timeOFF[currentState]);
                  reactionTime.push('--');
                  hitmissArray.push('Error');
                }
              }
           });
      }
      else {
        var timeON = [];var timeOFF = [];
        var currentState = 0;
        var onTime;var reaction;
        for (var i = 0; i < activationTime.length; i++) {
          timeON.push(setTimeout(function () {
            currentState = currentState + i;
            console.log("xxx", currentState);
            status = changeState(led[0],1);
            onTime = Date.now();
          },activationTime[i]));
          timeOFF.push(setTimeout(function () {
            status = changeState(led[0],0);
            reactionTime.push('--');
            hitmissArray.push('Miss');
          },desactivationTime[i]));
         }

         setTimeout(function () {
           console.log('Entrenamiento terminado');
           console.log(reactionTime);
           console.log(hitmissArray);
         }, desactivationTime[desactivationTime.length-1]+2000);


           inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
                if (err) {console.error('There was an error', err); //output error message to console
                return err;
              }
              if (value != status) {
                console.log("yyy", currentState);
                console.log('Cambio de estado');
                status = changeState(led[0],0);
                clearTimeout(timeOFF[(currentState/noTry)-1]);
                var reaction = Date.now();
                reactionTime.push(reaction-onTime);
                socket.emit('tiempo',reaction-onTime,'Hit');
                hitmissArray.push('Hit');
              }
           });
      }

    }


  });

//******************************************************************************
  socket.on('entrenamiento1', function(data) {
    const totalTime = 90000; //Tiempo total del ejercicio
    const noTry = data; //Numero de repeticiones
    const stepTime = Math.floor(totalTime/noTry); //Tiempo maximo en el que se debe activar/desactivar una salida
    var activationTime = [];var desactivationTime = [];var reactionTime = [];var hitmissArray = [];
    var status = 0;
    console.log('Cantidad', noTry);
    console.log('Max time', stepTime);

    for (var i = 0; i < noTry; i++) {
      activationTime.push(getRandomInt(0,(stepTime-3000))+(i*stepTime));
      desactivationTime.push((i*stepTime)+stepTime);
    }
    desactivationTime[desactivationTime.length-1]=(totalTime-10); //Se apaga 0.1 segundo antes que termine el entrenamiento

    var timeON = [];var timeOFF = [];
    var currentState = 0;
    var onTime;var reaction;
    for (var i = 0; i < activationTime.length; i++) {
      timeON.push(setTimeout(function () {
        currentState = currentState + i;
        console.log("xxx", currentState);
        status = changeState(led[0],1);
        onTime = Date.now();
      },activationTime[i]));
      timeOFF.push(setTimeout(function () {
        status = changeState(led[0],0);
        reactionTime.push('--');
        hitmissArray.push('Miss');
      },desactivationTime[i]));
     }

     setTimeout(function () {
       console.log('Entrenamiento terminado');
       console.log(reactionTime);
       console.log(hitmissArray);
     }, desactivationTime[desactivationTime.length-1]+2000);


       inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
            if (err) {console.error('There was an error', err); //output error message to console
            return err;
          }
          if (value != status) {
            console.log("yyy", currentState);
            console.log('Cambio de estado');
            status = changeState(led[0],0);
            clearTimeout(timeOFF[(currentState/noTry)-1]);
            var reaction = Date.now();
            reactionTime.push(reaction-onTime);
            hitmissArray.push('Hit');
          }
       });


 });

    socket.on('entrenamiento2', function() {
      const step = 10;
      const stepTime = getRandomInt(3,5)*1000;
      const limitTime = 500;
      var activationTime = [];var desactivationTime = [];var reactionTime =[]; var hitmissArray = [];
      var status = 0;

      for (var i = 0; i < step; i++) {
        activationTime.push((i+1)*stepTime);
        desactivationTime.push(activationTime[i]+limitTime);
        console.log(activationTime[i]);
        console.log(desactivationTime[i]);
      }

      var timeON = [];var timeOFF = [];
      var currentState = 0;
      var onTime;var reaction;
      for (var i = 0; i < activationTime.length; i++) {
        timeON.push(setTimeout(function () {
          currentState = currentState + i;
          status = changeState(led[0],1);
          onTime = Date.now();
        },activationTime[i]));
        timeOFF.push(setTimeout(function () {
          status = changeState(led[0],0);
          reactionTime.push('--');
          hitmissArray.push('Miss');
        },desactivationTime[i]));
      }

     setTimeout(function () {
       console.log('Entrenamiento terminado');
       console.log(reactionTime);
       console.log(hitmissArray);
     }, desactivationTime[desactivationTime.length-1]+2000);

     inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
        if (err) {console.error('There was an error', err); //output error message to console
          return err;
        }

        if (value != status) {
          console.log("xxx", currentState);
          console.log('Cambio de estado');
          clearTimeout(timeOFF[(currentState/10)-1]);
          status = changeState(led[0],0);
          console.log('TimeOFF length', timeOFF.length);
          reaction = Date.now();
          reactionTime.push(reaction-onTime);
          hitmissArray.push('Hit');
        }
     });
 });


 socket.on('entrenamiento3', function() {
   const step = 10;
   const stepTime = 3000;
   const limitTime = 1000;
   var activationTime = [];var desactivationTime = [];var reactionTime = [];var hitmissArray = [];
   var activateModule = [];
   var status = 0;

   for (var i = 0; i < step; i++) {
     activationTime.push((i+1)*stepTime);
     desactivationTime.push(activationTime[i]+limitTime);
     activateModule.push(getRandomInt(0,2));
   }

   for (var i = 0; i < activationTime.length; i++) {
     console.log(activateModule[i]);
   }

   var timeON = [];var timeOFF = [];
   var currentState = 0;
   var onTime;var reaction;
   for (var i = 0; i < activationTime.length; i++) {
     onSetTimeout(i);
   }
   for (var i = 0; i < desactivationTime.length; i++) {
     offSetTimeout(i);
   }

  function onSetTimeout(i) {
    timeON.push(setTimeout(function () {
      if (i === 0){
        currentState = 0;
      }
      else {
        currentState = currentState + 1;
      }
      console.log('xxx', currentState);
      status = changeState(led[activateModule[i]],1);
      onTime = Date.now();
    },activationTime[i]));
  }

  function offSetTimeout(i) {
    timeOFF.push(setTimeout(function () {
      changeState(led[activateModule[i]],0);
      reactionTime.push('--');
      hitmissArray.push('Miss');
    },desactivationTime[i]));
  }

      setTimeout(function () {
        console.log('Entrenamiento terminado');
        console.log(reactionTime);
        console.log(hitmissArray);
      }, desactivationTime[desactivationTime.length-1]+2000);

      inputButtons[0].watch(function (err, value) { //Watch for hardware interrupts on pushButton
           if (err) {console.error('There was an error', err); //output error message to console
           return err;
         }
         if (value != status) {
           console.log('Cambio de estado');
           console.log('zzz',currentState);
           if (activateModule[currentState] === 0){
             status = changeState(led[0],0);
             clearTimeout(timeOFF[currentState]);
             reaction = Date.now();
             reactionTime.push(reaction-onTime);
             hitmissArray.push('Hit');
           }
           else {
             status = changeState(led[activateModule[currentState]],0);
             clearTimeout(timeOFF[currentState]);
             reactionTime.push('--');
             hitmissArray.push('Error');
           }
         }
      });
      inputButtons[1].watch(function (err, value) { //Watch for hardware interrupts on pushButton
           if (err) {console.error('There was an error', err); //output error message to console
           return err;
         }
         if (value != status) {
           console.log('Cambio de estado');
           console.log('zzz',currentState);
           if (activateModule[currentState] === 1){
             status = changeState(led[1],0);
             clearTimeout(timeOFF[currentState]);
             reaction = Date.now();
             reactionTime.push(reaction-onTime);
             hitmissArray.push('Hit');
           }
           else {
             status = changeState(led[activateModule[currentState]],0);
             clearTimeout(timeOFF[currentState]);
             reactionTime.push('--');
             hitmissArray.push('Error');
           }
         }
      });

});

});

process.on('SIGINT', function () { //on ctrl+c

  for (var i = 0; i < led.length; i++) {
    led[i].writeSync(0);
    led[i].unexport();
    inputButtons[i].unexport();
  }
  process.exit(); //exit completely

  });

// Funciones
