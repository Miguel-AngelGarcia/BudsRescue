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
      (this.radius = 3);
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

//we noticed, the image never showed up.
//Why? It takes time to load.
const player = new Player();
const projectiles = [];

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

//to address issue, we use this animation loop
//this will update our image continously
function animate() {
  requestAnimationFrame(animate);

  //filling background
  context.fillStyle = "#f6d7b0";
  context.fillRect(0, 0, canvas.width, canvas.height);

  //will animate projectiles
  projectiles.forEach((projectile) => {
    projectile.update();
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
            y: -2,
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
