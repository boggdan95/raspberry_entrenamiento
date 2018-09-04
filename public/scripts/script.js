var socket = io(); //load socket.io-client and connect to the host that serves the page

function startTraining(){
  var tipo = document.getElementById('reaccion').value;
  var tiempo = document.getElementById('tiempo').value;
  var reps = document.getElementById('repeticiones').value;
  var modulos = document.getElementById('modulo').value;
  var is_secuencial = document.getElementById('is_secuencial').checked;

  console.log(tipo, tiempo, reps, modulos, is_secuencial);

  socket.emit("entrenamiento general", tipo,tiempo,reps, modulos, is_secuencial);
}


socket.on('tiempo', function(tiempo,string) {
  console.log(tiempo);
  console.log(string);
});
