// Alignment enums

THREE.SpriteAlignment = {};
THREE.SpriteAlignment.topLeft = new THREE.Vector2( 1, -1 );
THREE.SpriteAlignment.topCenter = new THREE.Vector2( 0, -1 );
THREE.SpriteAlignment.topRight = new THREE.Vector2( -1, -1 );
THREE.SpriteAlignment.centerLeft = new THREE.Vector2( 1, 0 );
THREE.SpriteAlignment.center = new THREE.Vector2( 0, 0 );
THREE.SpriteAlignment.centerRight = new THREE.Vector2( -1, 0 );
THREE.SpriteAlignment.bottomLeft = new THREE.Vector2( 1, 1 );
THREE.SpriteAlignment.bottomCenter = new THREE.Vector2( 0, 1 );
THREE.SpriteAlignment.bottomRight = new THREE.Vector2( -1, 1 );

var textAlign = {
  center: new THREE.Vector2(0, 0),
  left: new THREE.Vector2(1, 0),
  topLeft: new THREE.Vector2(1, -1),
  topRight: new THREE.Vector2(-1, -1),
  right: new THREE.Vector2(-1, 0),
  bottomLeft: new THREE.Vector2(1, 1),
  bottomRight: new THREE.Vector2(-1, 1),
}
var fontHeightCache = {}

class CanvasText {

  constructor () {
    this.textWidth = null
    this.textHeight = null

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  get width () { return this.canvas.width }
  get height () { return this.canvas.height }

  drawText (text, ctxOptions) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = ctxOptions.font

    this.textWidth = Math.ceil(this.ctx.measureText(text).width)
    this.textHeight = getFontHeight(this.ctx.font)

    this.canvas.width = THREE.Math.nextPowerOfTwo(this.textWidth)
    this.canvas.height = THREE.Math.nextPowerOfTwo(this.textHeight)

    this.ctx.font = ctxOptions.font
    this.ctx.fillStyle = ctxOptions.fillStyle
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    this.ctx.fillText(text, 1, 1);

    return this.canvas
  }

}

function getFontHeight (fontStyle) {
  var result = fontHeightCache[fontStyle];

  if (!result)
  {
    var body = document.getElementsByTagName('body')[0];
    var dummy = document.createElement('div');

    var dummyText = document.createTextNode('MÉq');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', 'font:' + fontStyle + ';position:absolute;top:0;left:0');
    body.appendChild(dummy);
    result = dummy.offsetHeight;

    fontHeightCache[fontStyle] = result;
    body.removeChild(dummy);
  }

  return result;
}

class SpriteText2D extends THREE.Object3D {

  constructor(text = '', options = {}) {
    super();

    this._font = options.font || '30px Arial';
    this._fillStyle = options.fillStyle || '#FFFFFF';

    this.canvas = new CanvasText()

    this.align = options.align || THREE.SpriteAlignment.center

    // this._textAlign = options.align || "center"
    // this.anchor = Label.fontAlignAnchor[ this._textAlign ]
    this.antialias = typeof(options.antialias==="undefined") ? true : options.antialias
    this.text = text;
  }

  // delegate raycast method to mesh instance
  raycast () {
    return this.sprite.raycast.apply(this.sprite, arguments)
  }

  get width () { return this.canvas.textWidth }
  get height () { return this.canvas.textHeight }

  get text() {
    return this._text;
  }

  set text(value) {
    if (this._text !== value) {
      this._text = value;
      this.updateText();
    }
  }

  get font() {
    return this._font;
  }

  set font(value) {
    if (this._font !== value) {
      this._font = value;
      this.updateText();
    }
  }

  get fillStyle() {
    return this._fillStyle;
  }

  set fillStyle(value) {
    if (this._fillStyle !== value) {
      this._fillStyle = value;
      this.updateText();
    }
  }

  updateText() {
    this.canvas.drawText(this._text, {
      font: this._font,
      fillStyle: this._fillStyle
    })

    // cleanup previous texture
    this.cleanUp()

    this.texture = new THREE.Texture(this.canvas.canvas);
    this.texture.needsUpdate = true;
    this.applyAntiAlias()

    if (!this.material) {
      this.material = new THREE.SpriteMaterial({ map: this.texture });

    } else {
      this.material.map = this.texture
    }

    if (!this.sprite) {
      this.sprite = new THREE.Sprite( this.material )
      this.geometry = this.sprite.geometry
      this.add(this.sprite)
    }

    this.sprite.scale.set(this.canvas.width, this.canvas.height, 1)
    
    // this.material.map.offset.set( -0.5 + ((1/this.canvas.width) * (this.canvas.textWidth+20) ), 0.35 );
    // console.log( this.canvas.textWidth, this.canvas.width, this.canvas.textHeight, this.canvas.height );
    
    this.material.map.offset.set(
        -1/ (
                this.canvas.width/(
                    (( this.canvas.width - this.canvas.textWidth ) / 2) + 
                    ((this.canvas.textWidth/2) * this.align.x) 
                )
            ),
        1/ (
                this.canvas.height/(
                    (( this.canvas.height - this.canvas.textHeight ) / 2) + 
                    ((this.canvas.textHeight/2) * this.align.y) 
                )
            )
    )
    
    // this.material.map.offset.set( ((this.canvas.width/2) - (this.canvas.textWidth/2)) ,(- this.canvas.height/2)  );
				
    // this.sprite.position.x = ((this.canvas.width/2) - (this.canvas.textWidth/2)) + ((this.canvas.textWidth/2) * this.align.x)
    // this.sprite.position.y = (- this.canvas.height/2) + ((this.canvas.textHeight/2) * this.align.y)
  }

  cleanUp () {
    if (this.texture) {
      this.texture.dispose()
    }
  }

  applyAntiAlias () {
    if (this.antialias === false) {
      this.texture.magFilter = THREE.NearestFilter
      this.texture.minFilter = THREE.LinearMipMapLinearFilter
    }
  }

}

class Text2D extends THREE.Object3D {

  constructor(text = '', options = {}) {
    super();

    this._font = options.font || '30px Arial';
    this._fillStyle = options.fillStyle || '#FFFFFF';

    this.canvas = new CanvasText()

    this.align = options.align || THREE.SpriteAlignment.center
    this.side = options.side || THREE.DoubleSide

    // this._textAlign = options.align || "center"
    // this.anchor = Label.fontAlignAnchor[ this._textAlign ]
    this.antialias = typeof(options.antialias==="undefined") ? true : options.antialias
    this.text = text;
  }

  // delegate raycast method to mesh instance
  raycast () {
    return this.mesh.raycast.apply(this.mesh, arguments)
  }

  get width () { return this.canvas.textWidth }
  get height () { return this.canvas.textHeight }

  get text() {
    return this._text;
  }

  set text(value) {
    if (this._text !== value) {
      this._text = value;
      this.updateText();
    }
  }

  get font() {
    return this._font;
  }

  set font(value) {
    if (this._font !== value) {
      this._font = value;
      this.updateText();
    }
  }

  get fillStyle() {
    return this._fillStyle;
  }

  set fillStyle(value) {
    if (this._fillStyle !== value) {
      this._fillStyle = value;
      this.updateText();
    }
  }

  updateText() {
    this.cleanUp() // cleanup previous texture

    this.canvas.drawText(this._text, {
      font: this._font,
      fillStyle: this._fillStyle
    })

    this.texture = new THREE.Texture(this.canvas.canvas);
    this.texture.needsUpdate = true;
    this.applyAntiAlias()

    if (!this.material) {
      this.material = new THREE.MeshBasicMaterial({ map: this.texture, side: this.side });
      this.material.transparent = true

    } else {
      this.material.map = this.texture
    }

    if (!this.mesh) {
      this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas.width, this.canvas.height), this.material);
      this.geometry = this.mesh.geometry
      this.add(this.mesh)
    }

    this.mesh.position.x = ((this.canvas.width/2) - (this.canvas.textWidth/2)) + ((this.canvas.textWidth/2) * this.align.x)
    this.mesh.position.y = (- this.canvas.height/2) + ((this.canvas.textHeight/2) * this.align.y)

    // manually update geometry vertices
    this.geometry.vertices[0].x = this.geometry.vertices[2].x = -this.canvas.width/2
    this.geometry.vertices[1].x = this.geometry.vertices[3].x = this.canvas.width/2
    this.geometry.vertices[0].y = this.geometry.vertices[1].y = this.canvas.height/2
    this.geometry.vertices[2].y = this.geometry.vertices[3].y = -this.canvas.height/2
    this.geometry.verticesNeedUpdate = true
  }

  cleanUp () {
    if (this.texture) {
      this.texture.dispose()
    }
  }

  applyAntiAlias () {
    if (this.antialias === false) {
      this.texture.magFilter = THREE.NearestFilter
      this.texture.minFilter = THREE.LinearMipMapLinearFilter
    }
  }

}


