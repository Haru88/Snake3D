import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var container;
var camera, scene, renderer;
var snake,
  point,
  pausedForSpin,
  tempSpinProgress,
  moveDirection,
    nextDirection;
  
var geometry, edge, controls, eometry;

//const start values
const colors = ["red", "blue", "yellow", "green", "orange", "magenta"];
const FIELDSIZE = 50; //Must a value mod10;
const BLOCKSIZE = 10;
const DIRECTIONS = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
};

init();
createMobileControls();
newGame();
animate();
setInterval(movement, 9);

document.onkeydown = function (event) {
  if (event.keyCode == 65 && moveDirection != DIRECTIONS.RIGHT) {
    nextDirection = DIRECTIONS.LEFT;
  } else if (event.keyCode == 87 && moveDirection != DIRECTIONS.DOWN) {
    nextDirection = DIRECTIONS.UP;
  } else if (event.keyCode == 68 && moveDirection != DIRECTIONS.LEFT) {
    nextDirection = DIRECTIONS.RIGHT;
  } else if (event.keyCode == 83 && moveDirection != DIRECTIONS.UP) {
    nextDirection = DIRECTIONS.DOWN;
  }
  return event.returnValue;
};

function init() {
  //container erzeugen
  container = document.createElement("div");
  document.body.appendChild(container);

  //the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0xffffff, 1);

  //the scene
  scene = new THREE.Scene();

  //the camera
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.5,
    3000000
  );
  camera.position.set(-1, 225, 300);

  //control
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1.0;
  controls.enabled = false;

  //light
  // var dlight = new THREE.DirectionalLight('white');
  // dlight.position.set(- 5, 10, - 5);
  // scene.add(dlight);
  // var dlight2 = new THREE.DirectionalLight('white');
  // dlight2.position.set(5, -10, 5);
  // scene.add(dlight2);
  // var dlight3 = new THREE.DirectionalLight('white');
  // dlight3.position.set(-5, -10, -5);
  // scene.add(dlight3);
  // var dlight4 = new THREE.DirectionalLight('white');
  // dlight4.position.set(5, 10, 5);
  // scene.add(dlight4);

  scene.add(new THREE.AmbientLight("0x404040"));

  var metalBox;
  var boxGeom = FIELDSIZE * 2;
  geometry = new THREE.BoxGeometry(boxGeom, boxGeom, boxGeom);
  edge = new THREE.EdgesGeometry(geometry);
  var metalBox = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  metalBox.position.set(-5, -5, -5);
  scene.add(metalBox);

  //walls
  geometry = new THREE.BoxGeometry(BLOCKSIZE, FIELDSIZE * 2, BLOCKSIZE);
  var material = new THREE.MeshBasicMaterial({ color: "gray" });
  var longBox1 = new THREE.Mesh(geometry, material);
  longBox1.position.set(FIELDSIZE, -5, FIELDSIZE);
  scene.add(longBox1);
  var longBox2 = new THREE.Mesh(geometry, material);
  longBox2.position.set(FIELDSIZE, -5, -FIELDSIZE - BLOCKSIZE);
  scene.add(longBox2);
  var longBox3 = new THREE.Mesh(geometry, material);
  longBox3.position.set(-FIELDSIZE - BLOCKSIZE, -5, FIELDSIZE);
  scene.add(longBox3);
  eometry = new THREE.BoxGeometry(BLOCKSIZE, FIELDSIZE * 2, BLOCKSIZE);
  var longBox4 = new THREE.Mesh(geometry, material);
  longBox4.position.set(-FIELDSIZE - BLOCKSIZE, -5, -FIELDSIZE - BLOCKSIZE);
  scene.add(longBox4);

  //grids
  var gridHelper = [];
  for (var i = 0; i < 6; ++i) {
    gridHelper[i] = new THREE.GridHelper(FIELDSIZE * 2, FIELDSIZE / 5);
    scene.add(gridHelper[i]);
  }
  gridHelper[0].position.set(-5, FIELDSIZE - 5, -5);
  gridHelper[1].rotation.x += Math.PI / 2;
  gridHelper[1].position.set(-5, -5, -FIELDSIZE - 5);
  gridHelper[2].position.set(-5, -FIELDSIZE - 5, -5);
  gridHelper[3].rotation.x += Math.PI / 2;
  gridHelper[3].position.set(-5, -5, FIELDSIZE - 5, -5);
  gridHelper[4].position.set(FIELDSIZE - 5, -5, -5);
  gridHelper[4].rotation.z += Math.PI / 2;
  gridHelper[5].rotation.z += Math.PI / 2;
  gridHelper[5].position.set(-FIELDSIZE - 5, -5, -5);
}

function createMobileControls() {
  var outerDiv = document.createElement("div");
  outerDiv.style.margin = "auto";
  outerDiv.style.width = "210px";
  var innerDiv = document.createElement("div");
  innerDiv.style.margin = "auto";
  innerDiv.style.width = "70px";
  var btn = createButton("UP(W)", DIRECTIONS.DOWN, DIRECTIONS.UP);
  btn.style.position = "absolute";
  btn.style.bottom = "100px";
  innerDiv.appendChild(btn);
  var tr = document.createElement("tr");
  tr.style.position = "absolute";
  tr.style.bottom = "40px";

  var td = document.createElement("td");
  td.appendChild(createButton("LEFT(A)", DIRECTIONS.RIGHT, DIRECTIONS.LEFT));
  tr.appendChild(td);
  td = document.createElement("td");
  td.appendChild(createButton("DOWN(S)", DIRECTIONS.UP, DIRECTIONS.DOWN));
  tr.appendChild(td);
  td = document.createElement("td");
  td.appendChild(createButton("RIGHT(D)", DIRECTIONS.LEFT, DIRECTIONS.RIGHT));
  tr.appendChild(td);

  outerDiv.appendChild(tr);
  document.body.appendChild(innerDiv);
  document.body.appendChild(outerDiv);
}

function createButton(txt, nDir, dir) {
  var btn = document.createElement("BUTTON");
  btn.style.width = "70px";
  btn.style.height = "60px";
  var t2 = document.createTextNode(txt);
  btn.onclick = function () {
    if (moveDirection != nDir) {
      nextDirection = dir;
    }
  };
  btn.appendChild(t2);
  return btn;
}

function newGame() {
  //restore defaults
  nextDirection = DIRECTIONS.DOWN;
  pausedForSpin = false;
  scene.rotation.x = 0.7;
  scene.rotation.y = 0;
  scene.rotation.z = 0;

  //(re)init the snake
  snake = [];

  snake[snake.length] = getSnakeMesh(BLOCKSIZE * 1.3, "darkgreen");
  snake[snake.length - 1].position.set(0, FIELDSIZE, 0);
  scene.add(snake[snake.length - 1]);
  for (var i = 0; i < 10; ++i) {
    addBlock("green");
  }

  //(re)init the point
  point = new THREE.PointLight("yellow", 100, 100, 2.0);
  scene.add(point);
  initPoint();
}

function gameOver() {
  for (let j = 0; j < snake.length; ++j) {
    scene.remove(snake[j]);
  }
  scene.remove(point);
  newGame();
}

function getSnakeMesh(size, color) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({ color: color })
  );
}

function initPoint() {
  var r = Math.floor(Math.random() * 6);
  switch (r) {
    case 0:
      point.position.set(randomPosition(), FIELDSIZE, randomPosition());
      break;
    case 1:
      point.position.set(
        randomPosition(),
        randomPosition(),
        -FIELDSIZE - BLOCKSIZE
      );
      break;
    case 2:
      point.position.set(randomPosition(), randomPosition(), FIELDSIZE);
      break;
    case 3:
      point.position.set(
        randomPosition(),
        -FIELDSIZE - BLOCKSIZE,
        randomPosition()
      );
      break;
    case 4:
      point.position.set(FIELDSIZE, randomPosition(), randomPosition());
      break;
    default:
      point.position.set(
        -FIELDSIZE - BLOCKSIZE,
        randomPosition(),
        randomPosition()
      );
      break;
  }
  r = Math.floor(Math.random() * colors.length);
  point.color.set(colors[r]);
  point.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(BLOCKSIZE, BLOCKSIZE, BLOCKSIZE),
      new THREE.MeshBasicMaterial({ color: colors[r] })
    )
  );
}

function randomPosition() {
  var r = Math.random() < 0.5 ? -1 : 1;
  var v = Math.floor((Math.random() * FIELDSIZE) / BLOCKSIZE) * BLOCKSIZE;
  return v * r;
}

function addBlock(color) {
  var lastRotation = snake[snake.length - 1].rotation;
  var lastPosition = snake[snake.length - 1].position;
  snake[snake.length - 1].geometry.dispose();
  snake[snake.length - 1].geometry = new THREE.BoxGeometry(
    BLOCKSIZE,
    BLOCKSIZE,
    BLOCKSIZE
  );
  snake[snake.length] = getSnakeMesh(BLOCKSIZE * 1.3, color);
  snake[snake.length - 1].rotation.set(
    lastRotation.x,
    lastRotation.y,
    lastRotation.z
  );
  snake[snake.length - 1].position.set(
    lastPosition.x,
    lastPosition.y,
    lastPosition.z
  );
  scene.add(snake[snake.length - 1]);
}

function movement() {
  if (!pausedForSpin) {
    //Hit the Point
    if (
      Math.round(snake[snake.length - 1].position.x) == point.position.x &&
      Math.round(snake[snake.length - 1].position.y) == point.position.y &&
      Math.round(snake[snake.length - 1].position.z) == point.position.z
    ) {
      addBlock(point.color);
      addBlock(point.color);
      initPoint();
    }

    switch (moveDirection) {
      case DIRECTIONS.LEFT:
        snake[snake.length - 1].translateX(-1);
        break;
      case DIRECTIONS.RIGHT:
        snake[snake.length - 1].translateX(1);
        break;
      case DIRECTIONS.UP:
        snake[snake.length - 1].translateZ(-1);
        break;
      case DIRECTIONS.DOWN:
        snake[snake.length - 1].translateZ(1);
        break;
    }

    //Reset the Point if spawn inside snake
    for (var i = 0; i < snake.length - 1; ++i) {
      if (
        point.position.x == Math.round(snake[i].position.x) &&
        point.position.y == Math.round(snake[i].position.y) &&
        point.position.z == Math.round(snake[i].position.z)
      ) {
        initPoint();
      }
    }

    if (isInGrid(snake)) {
      CheckCollision();

      //touch vertícal edge
      var s = snake[snake.length - 1].position;
      if (
        (Math.round(s.z) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.y) == FIELDSIZE) ||
        (Math.round(s.z) == FIELDSIZE && Math.round(s.y) == FIELDSIZE) ||
        (Math.round(s.y) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.z) == FIELDSIZE) ||
        (Math.round(s.y) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.z) == -FIELDSIZE - BLOCKSIZE)
      ) {
        startRotation();
      }
      //touch horizontal edge
      else if (
        (Math.round(s.x) == FIELDSIZE && Math.round(s.y) == FIELDSIZE) ||
        (Math.round(s.x) == FIELDSIZE &&
          Math.round(s.y) == -FIELDSIZE - BLOCKSIZE) ||
        (Math.round(s.x) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.y) == -FIELDSIZE - BLOCKSIZE) ||
        (Math.round(s.x) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.y) == FIELDSIZE)
      ) {
        startRotation();
      }

      //touch the walls
      else if (
        (Math.round(s.x) == FIELDSIZE && Math.round(s.z) == FIELDSIZE) ||
        (Math.round(s.x) == FIELDSIZE &&
          Math.round(s.z) == -FIELDSIZE - BLOCKSIZE) ||
        (Math.round(s.x) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.z) == -FIELDSIZE - BLOCKSIZE) ||
        (Math.round(s.x) == -FIELDSIZE - BLOCKSIZE &&
          Math.round(s.z) == FIELDSIZE)
      ) {
        gameOver();
      }

      // //Update the tail
      for (i = 1; i < snake.length; ++i) {
        snake[i - 1].position.set(
          snake[i].position.x,
          snake[i].position.y,
          snake[i].position.z
        );
      }

      moveDirection = nextDirection;
    }
  }
}

function CheckCollision() {
  for (let i = 0; i < snake.length - 1; ++i) {
    if (
      Math.round(snake[snake.length - 1].position.x) ==
        Math.round(snake[i].position.x) &&
      Math.round(snake[snake.length - 1].position.y) ==
        Math.round(snake[i].position.y) &&
      Math.round(snake[snake.length - 1].position.z) ==
        Math.round(snake[i].position.z)
    ) {
      gameOver();
    }
  }
}

function isInGrid(snake) {
  var sx = Math.abs(Math.round(snake[snake.length - 1].position.x));
  var sy = Math.abs(Math.round(snake[snake.length - 1].position.y));
  var sz = Math.abs(Math.round(snake[snake.length - 1].position.z));
  if (sz % 10 == 0 && sy % 10 == 0 && sx % 10 == 0) {
    return true;
  } else {
    return false;
  }
}

function startRotation() {
  nextDirection = moveDirection;
  tempSpinProgress = 0;
  pausedForSpin = true;
}

function rotateScene() {
  const degrees = Math.PI / 2;
  const INC = degrees / 16;
  if (pausedForSpin && tempSpinProgress <= degrees) {
    if (moveDirection === DIRECTIONS.UP) {
      scene.rotation.x += INC;
      scene.rotation.x = stayInCircle(scene.rotation.x);
      if (Math.abs(Math.round(scene.rotation.z)) == Math.round(Math.PI)) {
        snake[snake.length - 1].rotation.x += INC;
      } else {
        snake[snake.length - 1].rotation.x -= INC;
      }
    } else if (moveDirection === DIRECTIONS.DOWN) {
      scene.rotation.x -= INC;
      scene.rotation.x = stayInCircle(scene.rotation.x);
      if (Math.abs(Math.round(scene.rotation.z)) == Math.round(Math.PI)) {
        snake[snake.length - 1].rotation.x -= INC;
      } else {
        snake[snake.length - 1].rotation.x += INC;
      }
    } else if (moveDirection == DIRECTIONS.RIGHT) {
      if (Math.abs(Math.round(scene.rotation.x - 0.5)) == Math.round(Math.PI)) {
        scene.rotation.z -= INC;
        scene.rotation.z = stayInCircle(scene.rotation.z);
        snake[snake.length - 1].rotation.z -= INC;
      } else {
        scene.rotation.z += INC;
        scene.rotation.z = stayInCircle(scene.rotation.z);
        snake[snake.length - 1].rotation.z -= INC;
      }
    } else if (moveDirection == DIRECTIONS.LEFT) {
      if (Math.abs(Math.round(scene.rotation.x - 0.5)) == Math.round(Math.PI)) {
        scene.rotation.z += INC;
        scene.rotation.z = stayInCircle(scene.rotation.z);
        snake[snake.length - 1].rotation.z += INC;
      } else {
        scene.rotation.z -= INC;
        scene.rotation.z = stayInCircle(scene.rotation.z);
        snake[snake.length - 1].rotation.z += INC;
      }
    }
    tempSpinProgress += INC;
  } else {
    pausedForSpin = false;
  }
}

function stayInCircle(axe) {
  return axe % (2 * Math.PI);
}

function animate() {
  console.log("animate");
  requestAnimationFrame(animate);
  if (point !== undefined) {
    point.rotation.x += 0.03;
    point.rotation.y += 0.03;
    point.rotation.z += 0.03;
  }
  rotateScene();
  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}
