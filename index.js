const canvas = document.querySelector("canvas");
const currScoreElement = document.getElementById("currScore");
const highScoreElement = document.getElementById("highScore");
const gameOverScreen = document.querySelector(".gameOverContainer");
const playAgainBtn = document.querySelector(".againBtn");

const context = canvas.getContext("2d");

//16:9 aspect ratio
canvas.width = 1024; //window.innerWidth;
canvas.height = 576; //window.innerHeight;

class Player {
  constructor() {
    //for moving around
    this.velocity = {
      x: 0,
      y: 0,
    };

    //will sway our character when moving
    this.sway = 0;

    //this.image =
    const image = new Image();
    image.src = "./Images/Appa_Saddle.png";

    this.opacity = 1;

    //will listen for when image fully loads
    //when it does, will set the properties of image to these
    image.onload = () => {
      const scale = 0.55;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      //will place character at bottom
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 15,
      };
    };
  }

  draw() {
    /*
    context.fillStyle = "red";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
    */
    context.save();

    /*
    globalAlpha specifies alpha (tranparency) value applied to images
    before they are drawn
    */
    context.globalAlpha = this.opacity;
    context.translate(
      player.position.x + player.width / 2,
      player.position.y + player.width / 2
    );

    context.rotate(this.sway);
    context.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.width / 2
    );

    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );

    context.restore();
    //need to move the canvas to player when we call 'sway'
    //save will create snapshot in time.  translate our canvas to player
    //will then rotate the canvas, which includes player
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

//need to create a projectile class
class Projectile {
  //set dynamically, thus need to pass a contructor argument
  constructor({ position, velocity }) {
    (this.position = position),
      //this could be something to help make a power-up
      (this.velocity = velocity),
      (this.radius = 5);
  }

  draw() {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

    context.fillStyle = "green";
    context.fill();
    context.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

//will show explosions when projectile hts enemy
class Particle {
  constructor({ position, velocity, radius, color }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;

    this.color = color;
    this.opacity = 1;
  }

  draw() {
    context.save();
    context.globalAlpha = this.opacity;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

    context.fillStyle = this.color;
    context.fill();
    context.closePath();
    //want to fade particles (opcaity) out
    context.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    /*
    did this to fade out particles
    we saw them disappear but then reappear. Go to animate and work on particles 
    */
    this.opacity -= 0.01;
  }
}

class BadGuy {
  constructor({ position }) {
    //for moving around
    this.velocity = {
      x: 0,
      y: 0,
    };

    //this.image =
    const image = new Image();
    image.src = "./Images/BadGuy.png";

    //will listen for when image fully loads
    //when it does, will set the properties of image to these
    image.onload = () => {
      const scale = 0.4;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;

      //will place character at bottom
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(badGuyProjectiles) {
    badGuyProjectiles.push(
      new BadGuyProjectile({
        //places projectiles in bottom-middle
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 3,
        },
      })
    );
  }
}

//need to create a projectile class
class BadGuyProjectile {
  //set dynamically, thus need to pass a contructor argument
  constructor({ position, velocity }) {
    (this.position = position),
      //this could be something to help make a power-up
      (this.velocity = velocity),
      (this.width = 6);
    this.height = 10;
  }

  draw() {
    context.fillStyle = "white";
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Grid {
  //each grid will have an array of badGuys
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 2,
      y: 0,
    };

    //making an array of bad guys
    this.badGuyGroup = [];

    //looping to create bad guys, minimum of 2 rows
    let rows = Math.floor(Math.random() * 4) + 2;
    let columns = Math.floor(Math.random() * 6) + 5;

    this.width = columns * 70;
    this.height = rows * 55;

    this.bottomMostLevel = this.position.y + this.height;
    for (let xAxis = 0; xAxis < columns; xAxis++) {
      for (let yAxis = 0; yAxis < rows; yAxis++) {
        this.badGuyGroup.push(
          new BadGuy({
            //need to pass position so they dont spawn on top of each other
            position: {
              x: xAxis * 70,
              y: yAxis * 55,
            },
          })
        );
      }
    }
  }

  //update will need to
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //want to see if grid bottom touches bottom of page
    this.bottomMostLevel += this.velocity.y;

    //effects movement per frame
    //we saw that instead of going down x pixels, it just drops down completely
    this.velocity.y = 0;
    //we didnt get the grid of bad guys to bounce off right side of screen.
    //Why? We enever set a width for the grid
    // -> this.width = columns * 70; (70 is width of column holding bad guy)
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 55; //55 is height of badGuy
    }
  }
}

//will be our background image
class Park {
  constructor(startPosition) {
    this.position = {
      x: 0,
      y: startPosition - 576,
    };

    this.originalPostition = startPosition;

    this.scrollSpeed = 1;
    //this.image =
    const image = new Image();
    image.src = "./Images/park3.png";

    //dimensions2048px x 2034px
    //we can w = w, and canvas height = 1/2 park
    image.onload = () => {
      let scale = 0.5;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
    };
  }

  draw() {
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    if (this.image) {
      this.draw();
      if (this.position.y == canvas.height) {
        this.position.y = -canvas.height + 1;
        //added the above +1 because we got a weird line between frames without this
      } else {
        this.position.y += this.scrollSpeed;
      }
    }
  }
}

//will show explosions when projectile hts enemy
class BackgroundButterfly {
  constructor({ position, velocity, colorNumber }) {
    this.position = position;
    this.velocity = velocity;

    this.colorNumber = colorNumber;
    this.opacity = 1;

    //this.image =
    const butterflyImage = new Image();
    let butterflyImageName = `./Images/Butterfly${colorNumber}.png`;
    butterflyImage.src = butterflyImageName;

    this.opacity = 1;

    //will listen for when image fully loads
    //when it does, will set the properties of image to these
    butterflyImage.onload = () => {
      const scale = 0.25;
      this.image = butterflyImage;
      this.width = butterflyImage.width * scale;
      this.height = butterflyImage.height * scale;
    };
  }

  draw() {
    context.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
  /*
    did this to fade out particles
    we saw them disappear but then reappear. Go to animate and work on particles 
    */
}

//we noticed, the image never showed up.
//Why? It takes time to load.
const player = new Player();
const background = new Park(canvas.height);
const background2 = new Park(0);
const projectiles = [];
const grids = [];
const badGuyProjectiles = [];
const particles = [];
const backgroundButterflies = [];

const keys = {
  a: {
    pressed: false,
  },

  d: {
    pressed: false,
  },

  ArrowUp: {
    pressed: false,
  },
};

//creates background butterflies
for (let q = 0; q < 12; q++) {
  let butterflyColor = (q % 4) + 1;
  backgroundButterflies.push(
    new BackgroundButterfly({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 01,
      },
      colorNumber: butterflyColor,
    })
  );
}

//we want the grid to spawn at different intervals
//

let frames = 0;
let randomInterval = 0;
setRandomInterval();

function setRandomInterval() {
  randomInterval = Math.floor(Math.random() * 1000 + 500);
}
let game = {
  over: false,
  active: true,
};
let score = 0;
let highScore = highScoreElement.innerHTML;

function setScore(score) {
  //should increase score with each enemy eliminated
  currScoreElement.innerHTML = score;
}

function loseCondition() {
  setTimeout(() => {
    game.active = false;
    gameOverScreen.classList.remove("hidden");

    highScore = highScoreElement.innerHTML;
    if (score > highScore) {
      highScoreElement.innerHTML = score;
    }
  }, 1000);
}

function createParticles({ character, colors }) {
  //when enemies explode, these are the colors we want to see
  for (let i = 0; i < 15; i++) {
    let colorKey = i % 3;
    let currColor = colors[colorKey];
    particles.push(
      new Particle({
        position: {
          x: character.position.x + character.width / 2,
          y: character.position.y + character.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: currColor,
      })
    );
  }
}

//to address issue, we use this animation loop
//this will update our image continously
function animate() {
  //colors we want to display on explosions
  let badGuyColors = ["#aad53f", "#f42604", "#7f7f74"];
  let playerColors = ["#964B00", "#e4d4c8", "#5A5A5A"];

  //will not animate after player death
  if (!game.active) return;

  requestAnimationFrame(animate);

  //filling background
  context.fillStyle = "#8ac362";
  context.fillRect(0, 0, canvas.width, canvas.height);

  background.update();
  background2.update();

  //background butterflies
  backgroundButterflies.forEach((backgroundButterfly, bgbIndex) => {
    if (backgroundButterfly.position.y > canvas.height) {
      backgroundButterfly.position.x = Math.random() * canvas.width;
      backgroundButterfly.position.y = -backgroundButterfly.height;
    }
    backgroundButterfly.update();
  });

  //grid of badGuys
  grids.forEach((grid, gIndex) => {
    grid.update();

    //spawn projectiles shot by enemies
    if (frames % 300 === 0 && grid.badGuyGroup.length > 0) {
      selectedBadGuy =
        grid.badGuyGroup[Math.floor(Math.random() * grid.badGuyGroup.length)];
      selectedBadGuy.shoot(badGuyProjectiles);
    }

    grid.badGuyGroup.forEach((badGuy, bgIndex) => {
      badGuy.update({ velocity: grid.velocity });

      //collision detection logic for projectiles
      projectiles.forEach((projectile, pIndex) => {
        //detects for colision
        //checks if top of projectile reaches bottom of badGuy
        // if yes, removes BadGuy from BagGuyGrop
        let projectWithinHeight =
          projectile.position.y - projectile.radius <=
          badGuy.position.y + badGuy.height;

        let projectileWithinBaddy =
          projectile.position.x + projectile.radius >= badGuy.position.x &&
          projectile.position.x - projectile.radius <=
            badGuy.position.x + badGuy.width;

        let projectileAboveBadGuyBottom =
          projectile.position.y + projectile.radius >= badGuy.position.y;
        if (
          projectWithinHeight &
          projectileWithinBaddy &
          projectileAboveBadGuyBottom
        ) {
          setTimeout(() => {
            //this confirms the badGuy we hit in in the appropriate array
            const badGuyFound = grid.badGuyGroup.find((badGuy2) => {
              return badGuy2 === badGuy;
            });

            //needed same for projectile
            const projectileFound = projectiles.find((projectile2) => {
              return projectile2 === projectile;
            });

            //need to remove projectile and BadGuy
            if (badGuyFound && projectileFound) {
              score += 100;
              //should increase score with each enemy eliminated
              setScore(score);

              createParticles({
                character: badGuy,
                colors: badGuyColors,
              });

              grid.badGuyGroup.splice(bgIndex, 1);
              projectiles.splice(pIndex, 1);

              //adjusting columns when they get shot down and eliminated
              //making sure grid bounces on new width not old width
              if (grid.badGuyGroup.length > 0) {
                const leftMostBadGuy = grid.badGuyGroup[0];
                const rightMostBadGuy =
                  grid.badGuyGroup[grid.badGuyGroup.length - 1];

                grid.width =
                  rightMostBadGuy.position.x -
                  leftMostBadGuy.position.x +
                  rightMostBadGuy.width;
                grid.position.x = leftMostBadGuy.position.x;

                let lowestRowY = 0;
                const groupSoFar = grid.badGuyGroup;

                groupSoFar.forEach((badGuyRemaining) => {
                  let badGuyBottom = badGuyRemaining.position.y;
                  if (badGuyBottom > lowestRowY) {
                    lowestRowY = badGuyBottom + 55;
                  }
                });
                grid.bottomMostLevel = lowestRowY;
                //removes grid if empty
              } else {
                grids.splice(gIndex, 1);
              }
            }
          }, 0);
        }
      });

      //what if badGuy reaches bottom? -> lose
      //bottom of badGuy
      let badGuyBottom = grid.bottomMostLevel;
      //console.log(playerHeight, playerLeft, playerRight);

      let badGuyReachesGround = badGuyBottom >= canvas.height;

      if (badGuyReachesGround) {
        loseCondition();
      }
    });
  });

  //will animate projectiles
  projectiles.forEach((projectile, index) => {
    //garbage collector, gets rid of projectileswhen they leave view height
    if (projectile.position.y + projectile.radius <= 0) {
      //to elimate projectiles flashing
      //1 additional frame before splie out, prevents flash from occuring
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  //badGuyProjectiles
  badGuyProjectiles.forEach((badGuyProjectile, index) => {
    if (
      badGuyProjectile.position.y + badGuyProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        badGuyProjectiles.splice(index, 1);
      }, 0);
    } else {
      badGuyProjectile.update();
    }

    //if bottom of projectile >= player.height, that is a hit
    let topOfPlayer =
      badGuyProjectile.position.y + badGuyProjectile.height >=
      player.position.y;
    let betweenPlayerWidth =
      badGuyProjectile.position.x + badGuyProjectile.width >=
        player.position.x + 40 &&
      badGuyProjectile.position.x <= player.position.x + player.width - 40;

    //projectile hits player
    if (topOfPlayer & betweenPlayerWidth) {
      //removes projectile that hit player
      setTimeout(() => {
        badGuyProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);

      //after 1 second, games will stop animating
      loseCondition(2000);

      createParticles({
        character: player,
        colors: playerColors,
      });
    }
  });

  //renders particles
  particles.forEach((particle, pIndex) => {
    /* 
    using this to eliminate particles that have opacity 0 (after enemy
      explosion) prevents particles from reappearing
    */
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(pIndex, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  //drawging image
  player.update();

  if (keys.a.pressed && player.position.x + 38 >= 0) {
    player.velocity.x = -4;
    player.sway = -0.2;
  } else if (keys.d.pressed && player.position.x + 87 <= canvas.width) {
    player.velocity.x = 4;
    player.sway = 0.2;
  } else {
    player.velocity.x = 0;
  }

  //spawn enemies at every n frames
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    setRandomInterval();
    //might get weird values if we let frames go unchecked
    //set it to 0, will still let grid go down
    frames = 0;
  }
  frames++;
}
animate();

//will add listener for our moveaament keys
//'{}' denotes object destructuring
addEventListener("keydown", ({ key }) => {
  //stops us from shooting when player "dies"
  if (game.over) return;

  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case "ArrowUp":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -4,
          },
        })
      );
  }
});

//need a section to set movement to false.
//will stop moving character when key is no longer pressed

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      player.sway = 0;
      break;
    case "d":
      keys.d.pressed = false;
      player.sway = 0;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
  }
});

const resetGame = function () {
  game = {
    over: false,
    active: true,
  };

  score = 0;

  player.image.onload();

  player.opacity = 1;

  projectiles.length = 0;
  grids.length = 0;
  badGuyProjectiles.length = 0;
  particles.length = 0;

  gameOverScreen.classList.add("hidden");
  setRandomInterval();
  animate();
};

playAgainBtn.addEventListener("click", resetGame);
