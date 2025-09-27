import {sprites} from "./sprites.js"

const keys = {
    w: {
        pressed: false,
    },
    
    a: {
        pressed: false,
    },

    s: {
        pressed: false,
    },

    d: {
        pressed: false,
    },

    space: {
        pressed: false,
    },
}

let img = new Image()
img.src = './mario_and_luigi_sprites.png'

export class Mario {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.force = 5
        this.speed = 0
        this.keys = keys
        this.currentLadder = null
        this.isJumping = false
        this.isClimbingDown = false
        this.movingLeft = false
        this.movingRight = false
        this.facingLeft = false
        this.facingRight = true
        this.loopLeft = [0, 17, 35.5]
        this.loopRight = [55, 38, 20]
        this.loopIndex = 0
        this.timeSinceLastFrameChange = 0
        this.timeBetweenFrames = 60

        document.addEventListener("keydown", (e) => {
            switch(e.key) {
                case "w":
                    this.keys.w.pressed = true;
                    break;

                case "s":
                    this.keys.s.pressed = true;
                    break;

                case "a":
                    this.keys.a.pressed = true;
                    break;

                case "d":
                    this.keys.d.pressed = true;
                    break;

                case " ":
                    this.keys.space.pressed = true;
                    break;
            }
        })

        document.addEventListener("keyup", (e) => {
            switch(e.key) {
                case "w":
                    this.keys.w.pressed = false;
                    break;

                case "s":
                    this.keys.s.pressed = false;
                    break;

                case "a":
                    this.keys.a.pressed = false;
                    break;

                case "d":
                    this.keys.d.pressed = false;
                    break;

                case " ":
                    this.keys.space.pressed = false;
                    break;
            }
        })
    }

    setCharacter(character) {
        this.character = character
    }

    drawFrame(spriteX, spriteY) {
        this.sprites.drawSprite(spriteX, spriteY, 15, 18, this.x, this.y, this.width, this.height)
    }
    
    drawMario(ctx, elapsed) {

        this.sprites = new sprites(ctx)
        
        let standLeft = []
        let standRight = []
        let jumpLeft = []
        let jumpRight = []
        let moveLeft
        let moveRight

        if (this.character == "Mario") {
            standLeft = [0, -1]
            standRight = [55, 17]
            jumpLeft = [52, -1]
            jumpRight = [2, 18.5]
            moveLeft = -1
            moveRight = 17.1
        }

        else if (this.character == "Luigi") {
            standLeft = [0, 35]
            standRight = [55, 53]
            jumpLeft = [52, 36.5]
            jumpRight = [2, 54.5]
            moveLeft = 35.1
            moveRight = 53.1
        }

        // Jumping
        if (this.isJumping) {
            
            if (this.movingLeft) {
                this.drawFrame(jumpLeft[0], jumpLeft[1])
            }

            else if (this.movingRight || this.facingRight) {
                this.drawFrame(jumpRight[0], jumpRight[1])
            }
        }

        // Standing
        else if (this.facingLeft && !this.keys.a.pressed) {
            this.drawFrame(standLeft[0], standLeft[1])
        }

        else if (this.facingRight && !this.keys.d.pressed) {
            this.drawFrame(standRight[0], standRight[1])
        }

        // Running
        else if (!this.isJumping) {
            
            // Increase time since last frame change by elapsed time
            this.timeSinceLastFrameChange += elapsed

            // If it's time for a new frame
            if (this.timeSinceLastFrameChange >= this.timeBetweenFrames) {

                // Reset the timer
                this.timeSinceLastFrameChange = 0

                // Move to the next frame
                this.loopIndex++

                // If we've reached the end of the animation sequence, start over
                if (this.loopIndex >= this.loopRight.length) {
                    this.loopIndex = 0
                }
            }

            if (this.movingLeft) {
                this.drawFrame(this.loopLeft[this.loopIndex], moveLeft)
            }
            
            else if (this.movingRight) {
                this.drawFrame(this.loopRight[this.loopIndex], moveRight)
            }
        }
    }
      
    gravity() {
        this.y += (this.speed + this.force) / 9
        this.speed += 0.2
    }
    
    get marioBottom() {
        return this.y + this.height
    }

    collision(platform) {
        // Check if the bottom of Mario overlaps with the platform
        if (!this.isClimbingDown && !(this.jumpHeight >= 750) &&
            (this.marioBottom > platform.y && this.marioBottom - this.speed < platform.y + 24 &&
            this.x + this.width - 7 > platform.x && this.x < platform.x + (platform.w * 20) -50)) {
            // Collision detected
            this.isJumping = false
            this.y = platform.y - this.height
            this.force = 5
            this.speed = 0
        }

        // Invisible wall
        else if (this.y <= 86 && this.x < 500) {
            this.x = 500
        }
    }

    get marioMiddle() {
        return this.x + this.width / 2
    }
    
    ladderDetection(ladder) {
        let ladderEnd = ladder.x + 38
        let touchingLadder = false
        let aboveLadder = false

        // If Mario is touching a ladder
        if (this.marioMiddle >= ladder.x && this.marioMiddle <= ladderEnd && (this.y <= ladder.y && this.y >= ladder.y - (ladder.h * 10 + 70))) {
            this.currentLadder = ladder
            this.isClimbingDown = false
            this.speed = 0
            touchingLadder = true
        }

        // Mario is touching a ladder and the w key is pressed
        if (touchingLadder == true && this.keys.w.pressed) {
            this.speed = 0
            this.y -= 0.2
        }

        // Mario is touching a ladder and the s key is pressed
        else if (touchingLadder == true && this.keys.s.pressed) {
            this.speed = 0
            this.y += 0.2
        }
        
        /* If you let go of W or S while on a ladder */
        if (this.currentLadder && !this.keys.w.pressed && !this.keys.s.pressed) {
            this.force = 0
            this.speed = 0
        }

        // Mario is above a ladder
        else if (this.marioMiddle >= ladder.x && this.marioMiddle <= ladderEnd && (this.y < ladder.y - 50 && this.y > ladder.y - 200)) {
            aboveLadder = true
        }

        // Mario is above a ladder and the s key is pressed
        if (aboveLadder && this.keys.s.pressed) {
            this.isClimbingDown = true
        }

        if (this.keys.a.pressed || this.keys.d.pressed) {
            this.currentLadder = null
        }
    }

    move() {

        if (this.keys.space.pressed && !this.isJumping) {
            this.isJumping = true
            this.jumpHeight = 1000
            this.jumpHeight -= 2
        }
      
        if (this.isJumping) {
            this.y -= 2
            this.jumpHeight -= 2
        }

        if (this.keys.a.pressed) {
            this.x -= 1
            this.movingLeft = true
            this.movingRight = false
            this.lastKeyPressed = 'a'
        } 

        if (this.keys.d.pressed) {
            this.x += 1
            this.movingRight = true
            this.movingLeft = false
            this.lastKeyPressed = 'd'
        }

        if (this.lastKeyPressed === 'a') {
            this.facingLeft = true
            this.facingRight = false
        } 
        
        else if (this.lastKeyPressed === 'd') {
            this.facingLeft = false
            this.facingRight = true
        }
    }

    update(ctx, platforms, ladders, character, elapsed) {
        console.log(this.x, this.y);

        this.setCharacter(character)

        this.gravity()
        
        this.drawMario(ctx, elapsed)

        this.move()

        for (let i = 0; i < platforms.length; i++) {
            this.collision(platforms[i])
        }

        for (let i = 0; i < ladders.length; i++) {
            this.ladderDetection(ladders[i])
        }
    }
}