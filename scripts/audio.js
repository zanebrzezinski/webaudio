$(document).ready(function(){
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

  var filt = audioContext.createBiquadFilter();
  filt.connect(audioContext.destination);
  filt.frequency.value = 2000;
  $('#filter').on('input change', function(e){
    filt.frequency.value = e.currentTarget.value * 20;;
    console.log(filt.frequency.value)
  });

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
    console.log(lfo.frequency.value);
  });


  var keyList = [
    16, // Shift
    32, // Space
    68 // D
  ];
  for (var i = 0; i <= numSamples; i++) {
    players.push(null);
    envs.push(audioContext.createGain());
  }

  envs.forEach(function(env){
    env.connect(tremelo);
    env.gain.value = 0;
  })


  function getSample (url, cb, player) {
    var request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      audioContext.decodeAudioData(request.response, cb)
    }
    request.send()
  }

  window.onkeydown = function(e) {
    for (var i = 0; i < keyList.length; i++) {
      if (e.keyCode == keyList[i]) {
        play(players[i], envs[i], '../assets/loop'+(i + 1)+'.wav');
      }
    }
  }

  window.onkeyup = function(e) {

    for (var i = 0; i < keyList.length; i++) {
      if (e.keyCode == keyList[i]) {
        envs[i].gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.9);
        players[i] = null;
      }
    }

    // if (e.keyCode == 16) {
    //   envs[0].gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.9);
    //   player = null;
    // }
    // if (e.keyCode == 32) {
    //   envs[1].gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.9);
    //   player = null;
    // }
    // if (e.keyCode == 68) {
    //   envs[2].gain.setTargetAtTime(0, audioContext.currentTime + 1, 0.9);
    //   player = null;
    // }
    if (e.keyCode == 81) {
      rate = rate / 2;
      $('#rate').text(rate);
      players.forEach(function(player){
        player.playbackRate = rate;
      });

    }
    if (e.keyCode == 87) {
      rate = rate * 2;
      $('#rate').text(rate);
      players.forEach(function(player){
        player.playbackRate = rate;
      });

    }
    if (e.keyCode == 69) {
      filt.frequency += 10;
    }
    if (e.keyCode == 82) {
      filt.frequency -= 10;
      console.log(filt.frequency);
    }
  }

  var play = function(player, env, file){
    if (!player) {
      player = audioContext.createBufferSource();
      player.connect(env);
      env.gain.setTargetAtTime(1, audioContext.currentTime, 0.9);
    }
    getSample(file, function play (buffer) {
      if (player.buffer === null) {
        player.buffer = buffer
      }
      player.start(startTime)
      player.playbackRate.value = rate;
      player.loop = true;
    });
  }



});
