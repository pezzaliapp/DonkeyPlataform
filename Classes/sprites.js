let img = new Image()
img.src = './mario_luigi_sprites2.png'

let img2 = new Image()
img2.src = './barrel_sprites.png'

let img3 = new Image()
img3.src = './DK_sprites.png'

export class sprites {
    constructor(ctx) {
        this.ctx = ctx
    }

    drawSprite(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        this.ctx.drawImage(img, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight)
    }

    drawSpriteBarrel(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        this.ctx.drawImage(img2, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight)
    }

    drawSpriteDK(spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight) {
        this.ctx.drawImage(img3, spriteX, spriteY, spriteWidth, spriteHeight, canvasX, canvasY, canvasWidth, canvasHeight)
    }
}