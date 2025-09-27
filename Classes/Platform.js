let img = new Image()
img.src = './mario_and_luigi_sprites.png'

export class Platform {
    constructor(x, y, w) {
        this.x = x
        this.y = y
        this.w = w
    }

    drawPlatform(ctx) {
        const spriteX = 152
        const spriteY = 154
        const spriteWidth = 9
        const spriteHeight = 8
        
        for (let i = 0; i < this.w; i++) {
            const x = this.x + i * 15
            ctx.drawImage(img, spriteX, spriteY, spriteWidth, spriteHeight, x, this.y, 20, 24)
        }
    }
}