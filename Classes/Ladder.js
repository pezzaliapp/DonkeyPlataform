let img = new Image()
img.src = './mario_and_luigi_sprites.png'

export class Ladder {
    constructor(x, y, h) {
        this.x = x
        this.y = y
        this.h = h
    }

    drawLadder(ctx) {
        const spriteX = 130
        const spriteY = 151.5
        const spriteWidth = 10.5
        const spriteHeight = 9
        
        for (let i = 0; i < this.h; i++) {
            const y = this.y - i * 15
            ctx.drawImage(img, spriteX, spriteY, spriteWidth, spriteHeight, this.x, y, 38, 38)
        }
    }
}