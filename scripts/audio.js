$(document).ready(function(){
  //init sum stuff
  var audioContext = new AudioContext()
  var startTime = 0;
  var spaceDown;
  var dDown;
  var rate = 1;
  var numSamples = 3;
  $('#numsamples').text(numSamples);
  $('#rate').text(rate);
  var players = [];
  var envs = [];

  //init lowpass filter
  var filt = audioContext.createBiquadFilter();
  filt.connect(audioContext.destination);
  filt.frequency.value = 2000;
  $('#filter').on('input change', function(e){
    filt.frequency.value = e.currentTarget.value * 20;;
  });

  //init tremelo and ctrl lfo
  var tremelo = audioContext.createGain();
  tremelo.connect(filt);
  tremelo.gain.value = 0;
  var lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 2;
  lfo.connect(tremelo.gain);
  lfo.start(audioContext.currentTime);
  $('#tremelo').on('input change', function(e){
    lfo.frequency.value = e.currentTarget.value * .08;
  });


  var keyList = [
    16, // Shift
    32, // Space
    68 // D
  ];
  var keyDown = [];
  for (var i = 0; i < keyList.length; i++) {
    keyDown.push(false);
  }

  //create dummy player (null) in players array and populate envelopes array
  for (var i = 0; i < numSamples; i++) {
    players.push(null);
    envs.push(audioContext.createGain());
  }

  //connect envelopes to FX chain (tremelo -> filter)
  envs.forEach(function(env){
    env.connect(tremelo);
    env.gain.value = 0;
  })

  //does what it sez on the tin.
  function getSample (url, cb, player) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      audioContext.decodeAudioData(request.response, cb)
    }
    request.send()
  }

  var play = function(player, env, file, i){
      if (!keyDown[i]) {
        console.log(player);
        console.log(players);
        if (!player) {
          player = audioContext.createBufferSource();
          players[i] = player;
          player.connect(env);
          env.gain.setTargetAtTime(1, audioContext.currentTime, 0.9);
          getSample(file, function play (buffer) {
            if (player.buffer === null) {
              player.buffer = buffer
            }
            player.start(startTime)
            player.playbackRate.value = rate;
            player.loop = true;
          });
        }
      }

  }

  //init player, play sound, set keydown throttle
  window.onkeydown = function(e) {
    for (var i = 0; i < keyList.length; i++) {
      if (e.keyCode == keyList[i]) {
        play(players[i], envs[i], '../assets/loop'+(i + 1)+'.wav', i);
        keyDown[i] = true;
      }
    }
  }

  window.onkeyup = function(e) {
    //stop sounds and reset players/keytracker
    for (var i = 0; i < keyList.length; i++) {
      if (e.keyCode == keyList[i]) {
        envs[i].gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.9);
        players[i] = null;
        keyDown[i] = false;
      }
    }

    if (e.keyCode == 81) {
      rate = rate / 2;
      $('#rate').text(rate);
      players.forEach(function(player){
        if (player) {
          player.playbackRate = rate;
        }
      });
    }
    if (e.keyCode == 87) {
      rate = rate * 2;
      $('#rate').text(rate);
      players.forEach(function(player){
        if (player) {
          player.playbackRate = rate;
        }
      });
    }
  }




});
