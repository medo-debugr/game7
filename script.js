const pad = document.querySelector('#paddle')
const ball = document.querySelector('#ball')
const sm = document.querySelector('#start_message')
const combo_span = document.querySelector('#combo_span')
const bg_music = document.querySelector('#bg_music')
bg_music.volume = .25
const gem_collect = 'http://contentservice.mc.reyrey.net/audio_v1.0.0/?id=73702d54-159c-5403-9706-99824dee8d9e'
const miss_ball = document.querySelector('#miss_ball')
const you_died = document.querySelector('#you_died')
const game_round = document.querySelector('.game_round')
const game_blocks = document.querySelector('.game_blocks')
const game_combo = document.querySelector('.game_combo')
const game_score = document.querySelector('.game_score')
let score = 0
let misses = 1
let round = 1
var best_combo = 0
var combo = []
let pad_l = window.innerWidth*.45
var kd = false
var btn_speed = 1
var frames = 60

function trackKeys(e) {
  if(kd) {    
    if(btn_speed < 30) {
      btn_speed += 5
    }
    // console.log(k)
    if(kd == 37 && pad_l > 0) {
      pad_l -= btn_speed
    }
    if(kd == 39 && pad_l < window.innerWidth) {
      pad_l += btn_speed
    }  
    pad.style.left = pad_l + 'px'
  }  
}

window.addEventListener('keydown', function(e){
  kd = e.keyCode
})
window.addEventListener('keyup', function(){
  kd = false
  btn_speed = 5
})

function muteSound(e) {
  if(e.classList.contains('muted')) {
    bg_music.volume = .25
    miss_ball.volume = 1
    you_died.volume = 1
    e.classList.remove('muted')
    e.children[0].innerHTML = 'volume_up'
  } else {
    bg_music.volume = 0
    miss_ball.volume = 0
    you_died.volume = 0
    e.classList.add('muted')
    e.children[0].innerHTML = 'volume_off'
  }
}

function borderRadius() {
  return Math.floor(Math.random()*40) + 'px'
}

function cloneBall() {
  var cln = ball.cloneNode(true)

  cln.classList.add('trail')
  cln.id = ''
  document.body.appendChild(cln)

  setTimeout(function() {
    document.querySelectorAll('.trail')[0].remove()
  }, 500)
}

let blocks = 60
var blocksPer = 10
if(window.innerHeight > window.innerWidth) {
  blocks = 30
  blocksPer = 5
}
function addBlocks() {
  for(var i=0;i<blocks;i++) {
    var b = document.createElement('div')
    b.className = 'block'
    b.style.width = window.innerWidth / blocksPer + 'px'
    b.style.backgroundColor = 'hsl('+(Math.floor(i/blocksPer))*60+'deg,100%,40%)'
    b.style.left = (i % blocksPer)*(window.innerWidth*(100/blocksPer/100)) + 'px'
    b.style.top = Math.floor(i/blocksPer)*(window.innerHeight*.08) + 'px'
    b.style.borderRadius = ''+borderRadius()+' '+borderRadius()+' '+borderRadius()+' '+borderRadius()+''
    b.innerHTML = (100*round) - Math.floor(i/blocksPer)*10
    document.body.appendChild(b)
  }
}
window.addEventListener('mousemove', function(e){
  var x = e.clientX
  var y = e.clientY
  pad.style.left = x + 'px'
})

window.addEventListener('touchmove', function(e){
  var x = e.touches[0].clientX
  var y = e.clientY
  pad.style.left = x + 'px'
})

var ball_t = -1,
    ball_l = Math.random() > .5 ? 1 : -1,
    ball_speed = 5

function playTheGame(){
  // initial game reset stuff
  bg_music.play()
  sm.removeEventListener('click', playTheGame)
  misses = 1
  score = 0
  round = 1
  best_combo = 0
  ball_speed = 5
  resetBlocks()  
  document.documentElement.style.setProperty('--pad-color', "sienna")
  document.documentElement.style.setProperty('--game-score', "'"+score+"'")
  // pad.style.width = (window.innerWidth*.15) / misses + 'px'

  function moveBall() {
    trackKeys()
    var ball_loc = ball.getBoundingClientRect()
    if(ball_loc.left + ball_loc.width >= window.innerWidth) {
      ball_l = -1
    } 
    if(ball_loc.left <= 0) {
      ball_l = 1
    }
    if(ball_loc.top + ball_loc.height >= window.innerHeight) {
      ball_t = -1
      misses++
      if(misses == 2) {
        document.documentElement.style.setProperty('--pad-color', "hsla(0deg,100%,50%,33%)")
      }
      if(misses == 3) {
        document.documentElement.style.setProperty('--pad-color', "hsla(0deg,100%,50%,66%)")
      }
      if(misses > 3) {
        document.documentElement.style.setProperty('--pad-color', "hsla(0deg,100%,50%,100%)")
      }
      miss_ball.play()
      comboScore()
    } 
    if(ball_loc.top <= 0) {
      ball_t = 1
    }  

    ball.style.left = ball_loc.left + (ball_l * ball_speed) + 'px'
    ball.style.top = ball_loc.top + (ball_t * ball_speed) + 'px'  

    // collison detection
    var half_ball = ball_loc.width*.5
    if(ball_t > 0) {
      var b_class = document.elementFromPoint(ball_loc.left + half_ball, ball_loc.top + ball_loc.width)
      } else {
        var b_class = document.elementFromPoint(ball_loc.left + half_ball, ball_loc.top)
        }

    var b_class_loc = b_class.getBoundingClientRect()    

    //control angles based on where it hits paddle
    function rockPaddle() {
      pad.classList.add('paddle_rock')
      setTimeout( function(){
        pad.classList.remove('paddle_rock')
      }, 500)
    }

    if(b_class.classList.contains('pad_right')) {
      ball_t = -1
      ball_l = 1
      rockPaddle()
      comboScore()
    }
    if(b_class.classList.contains('pad_center')) {
      ball_t = -1.25
      rockPaddle()
      comboScore()
    }
    if(b_class.classList.contains('pad_left')) {
      ball_t = -1
      ball_l = -1
      rockPaddle()
      comboScore()
    }

    // if ball hits block

    if(b_class.classList.contains('block')) {    
      ball_t = -ball_t
      if(ball_speed < 15.5) {
        ball_speed += .1  
      }
      b_class.className = 'dead'
      combo.push(+b_class.innerHTML)
      combo_span.innerHTML = combo.length
      if(combo.length >= 10) {
        frames = 30
      } else {
        frames = 60
      }

      if(!document.querySelector('.muted')) {
        var got_gem = new Audio(gem_collect)
        got_gem.volume = Math.random() < .5 ? 1 : .5
        got_gem.play()  
      }      

      document.querySelectorAll('.dead')[0].remove() 

      if(!document.querySelector('.block')) {
        setTimeout(function(){
          round++
          addBlocks()  
        }, 500)
      }
    }  

    // trail trail trail
    cloneBall()

    // when dead
    if(misses > 3) {
      setTimeout(function(){
        you_died.play()  
      },750)      
      ball.style.left = ''
      ball.style.top = ''
      clearInterval(rungame)

      game_round.innerHTML = round
      game_blocks.innerHTML = (round*blocks) - document.querySelectorAll('.block').length
      game_combo.innerHTML = best_combo
      game_score.innerHTML = score

      sm.addEventListener('click', playTheGame)
      sm.classList.toggle('show_start')
      checkHighScore()
    }   
    // setTimeout(moveBall, 1000/frames)
  }


  //add hide message, place ball, and start game action
  sm.classList.toggle('show_start')
  ball.style.left = Math.random()*(window.innerWidth - 50) + 50 + 'px'
  ball.style.top = window.innerHeight*.75 + 'px'
  // moveBall()
  var rungame = setInterval(moveBall, 1000/frames)  

  }

function comboScore() {
  var length = combo.length
  if(length > best_combo) {
    best_combo = length
  }
  var sum = combo.reduce(function(a, b) { return a + b; }, 0);
  score += length * sum
  document.documentElement.style.setProperty('--game-score', "'"+score+"'")
  // console.log(length * sum)
  combo = []
  combo_span.innerHTML = 0
}

window.addEventListener('DOMContentLoaded', function() {
  setTimeout(function(){
    addBlocks()
    sm.addEventListener('click', playTheGame)
  }, 500)
});

function resetBlocks() {
  let b = document.querySelectorAll('.block')
  b.forEach(function(elm) { elm.remove() })

  addBlocks()
}

function checkHighScore() {
  if(localStorage.getItem('gem-miner-score')) {
    if(score > localStorage.getItem('gem-miner-score')) {
      localStorage.setItem('gem-miner-score', score)
      document.querySelector('#start_message p span').innerHTML = localStorage.getItem('gem-miner-score')
    }
    document.querySelector('#start_message p span').innerHTML = localStorage.getItem('gem-miner-score')
  } else {
    localStorage.setItem('gem-miner-score', 0)    
  }
}
checkHighScore()

function onClick() {
  console.log('clicked')
    // feature detect
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', motion, false);
          }
        })
        .catch(console.error);
    } else {
      // handle regular non iOS 13+ devices
    }
  }

if(window.DeviceMotionEvent){
  window.addEventListener("devicemotion", motion, false);
}else{
  console.log("DeviceMotionEvent is not supported");
}

function motion(event){
  var x = event.accelerationIncludingGravity.x
  if(x > 5) {
    x = 5
  }
  if(x < -5) {
    x = -5
  }
  pad.style.left = x < 0 ? (Math.abs(x)*10) + 50 + '%' : 50 - (Math.abs(x)*10) + '%'
  // console.log({x});
}