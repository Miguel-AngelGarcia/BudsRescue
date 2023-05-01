const canvas = document.querySelector("canvas");

const context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
      this.height,
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
      const scale = 0.5;
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
      this.height,
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

//we noticed, the image never showed up.
//Why? It takes time to load.
const player = new Player();
const projectiles = [];
const grids = [];
const badGuyProjectiles = [];

const keys = {
  a: {
    pressed: false,
  },

  d: {
    pressed: false,
  },

  space: {
    pressed: false,
  },
};

//we want the grid to spawn at different intervals
//

let frames = 0;
let randomInterval = Math.floor(Math.random() * 1000 + 500);

//to address issue, we use this animation loop
//this will update our image continously
function animate() {
  requestAnimationFrame(animate);

  //filling background
  context.fillStyle = "#f6d7b0";
  context.fillRect(0, 0, canvas.width, canvas.height);

  //
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

      //collision detection logic
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
                //removes grid if empty
              } else {
                grids.splice(gIndex, 1);
              }
            }
          }, 0);
        }
      });
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
        player.position.x &&
      badGuyProjectile.position.x <= player.position.x + player.width;
    if (topOfPlayer & betweenPlayerWidth) {
      console.log("hit");
    }
  });

  //drawging image
  player.update();

  if (keys.a.pressed && player.position.x + 43 >= 0) {
    player.velocity.x = -4;
    player.sway = -0.2;
  } else if (keys.d.pressed && player.position.x + 83 <= canvas.width) {
    player.velocity.x = 4;
    player.sway = 0.2;
  } else {
    player.velocity.x = 0;
  }

  //spawn enemies at every n frames
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 1000 + 500);
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
    case " ":
  }
});
