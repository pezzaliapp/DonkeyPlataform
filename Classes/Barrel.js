import {sprites} from "./sprites.js"

let img = new Image()
img.src = './mario_and_luigi_sprites.png'

export class Barrel {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.force = 0.5
        this.left = false
        this.right = false
        this.rollingLeft = [45, 30, 15, 0]
        this.rollingRight = [0, 15, 30, 45]
        this.rollingDown = [59, 78]
        this.loopIndex = 0
        this.scored = false
        this.hasScored = false
        this.scoreTimer = null
        this.scoreDelay = 800
        this.dead = false
        this.timeSinceLastFrameChange = 0
        this.timeBetweenFrames = 100
    }

    drawFrame(frameX) {
        this.sprites.drawSpriteBarrel(frameX, 0, 14, 12, this.x, this.y, this.width, this.height)
    }

    drawFalling(x) {
        this.sprites.drawSpriteBarrel(x, 0, 18, 18, this.x, this.y, this.width + 5, this.height + 5)
    }

    step(ctx, elapsed) {
        this.sprites = new sprites(ctx)

        if (this.right) {
            this.timeSinceLastFrameChange += elapsed
            if (this.timeSinceLastFrameChange >= this.timeBetweenFrames) {
                this.timeSinceLastFrameChange = 0
                this.loopIndex++
                
                if (this.loopIndex >= this.rollingRight.length) {
                    this.loopIndex = 0
                }

            }
            this.drawFrame(this.rollingRight[this.loopIndex])
        }

        else if (this.left) {
            this.timeSinceLastFrameChange += elapsed
            if (this.timeSinceLastFrameChange >= this.timeBetweenFrames) {
                this.timeSinceLastFrameChange = 0
                this.loopIndex++
                
                if (this.loopIndex >= this.rollingLeft.length) {
                    this.loopIndex = 0
                }

            }
            this.drawFrame(this.rollingLeft[this.loopIndex])
        }

        else if (!this.left && !this.right) {
            this.timeSinceLastFrameChange += elapsed
            if (this.timeSinceLastFrameChange >= this.timeBetweenFrames) {
                this.timeSinceLastFrameChange = 0
                this.loopIndex++
                
                if (this.loopIndex >= this.rollingDown.length) {
                    this.loopIndex = 0
                }

            }
            this.drawFalling(this.rollingDown[this.loopIndex])
        }
    }
    
    gravity() {
        this.y += this.force
    }

    move() {
        if (this.left) {
            this.x -= 1
        }
        
        else if (this.right) {
            this.x += 1
        }
    
        if (this.x < 1245 && this.y <= 106) {
            this.right = true
            this.left = false
        } 
        
        else if (this.x === 1245) {
            this.right = false
            this.left = false
        }
    
        if (this.y === 186 || this.y === 401 || this.y === 603) {
            this.left = true
        } 
        
        else if (this.x === 230 && this.y < 608) {
            this.left = false
        }
    
        if (this.y === 287 || this.y === 507) {
            this.right = true
        }
    
        if (this.x === 225 && this.y === 608) {
            this.left = true
            this.right = false
        }
    }    
    
    get barrelLeft() {
        return this.x
    }

    get barrelRight() {
        return this.x + this.width
    }

    get barrelTop() {
        return this.y
    }

    get barrelBottom() {
        return this.y + this.height
    }

    get barrelMiddle() {
        return (this.x + this.width) / 2
    }

    collision(platform, player) {
        const playerLeft = player.x
        const playerRight = player.x + player.width
        const playerTop = player.y
        const playerBottom = player.y + player.height
        const playerMiddle = (player.x + player.width) / 2

        // Check if the bottom of the barrel overlaps with the platform
        if (this.barrelBottom > platform.y && this.barrelBottom - this.force < platform.y + 24 &&
            this.x + this.width - 7 > platform.x && this.x < platform.x + (platform.w * 20) - 40) {
          // Collision detected
          this.y = platform.y - this.height
        }

        else if (!this.hasScored && player.isJumping && ((playerMiddle >= this.barrelMiddle - 2 && playerMiddle <= this.barrelMiddle + 2) && (playerBottom < this.y && playerBottom > this.y - 20))) {
            this.scored = true
            this.hasScored = true
            this.scoreTimer = setTimeout(() => {
                this.hasScored = false
            }, this.scoreDelay)
        }

        /* Losing a life */

        else if (this.barrelLeft + 5 < playerRight &&
                 this.barrelRight - 5 > playerLeft &&
                 this.barrelTop + 5 < playerBottom &&
                 this.barrelBottom - 5 > playerTop) {
            this.dead = true
        }
    }
    
    update(ctx, platforms, player, elapsed) {

        this.move()
        this.step(ctx, elapsed)
        this.gravity()
        
        for (let i = 0; i < platforms.length; i++) {
            this.collision(platforms[i], player)
        }
    }
}