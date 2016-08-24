var THREEx = THREEx || {}

THREEx.Planets	= {}

THREEx.Planets.baseURL	= './images/'

// from http://planetpixelemporium.com/

// THREEx.Planets.createStarfield	= function(){
// 	var texture	= THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/galaxy_starfield.png')
// 	var material	= new THREE.MeshBasicMaterial({
// 		map	: texture,
// 		side	: THREE.BackSide
// 	})
// 	var geometry	= new THREE.SphereGeometry(200, 32, 32)
// 	var mesh	= new THREE.Mesh(geometry, material)
// 	return mesh	
// }
THREEx.Planets.Starfield = class Starfield extends THREE.Mesh {
    constructor( size )
    {
        super(
            new THREE.SphereGeometry( size, 32, 32 ),
            new THREE.MeshBasicMaterial({
        		map	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'galaxy_starfield.png'),
        		side	: THREE.BackSide
        	})
        );
    }
}

// THREEx.Planets.createSun	= function(){
// 	var geometry	= new THREE.SphereGeometry(1, 32, 32)
// 	var texture	= THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/sunmap.jpg')
// 	var material	= new THREE.MeshPhongMaterial({
// 		map	: texture,
// 		bumpMap	: texture,
// 		bumpScale: 0.05,
// 	})
// 	var mesh	= new THREE.Mesh(geometry, material)
// 	return mesh	
// }
THREEx.Planets.Sun = class Sun extends THREE.Mesh {
    constructor( options )
    {
        options = options || {};
        
        var sphere,
            texture	= THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'sunmap.jpg')
        
        super(
            sphere = new THREE.SphereGeometry(695700, 32, 32),
            new THREE.MeshPhongMaterial({
        		map	: texture,
        		bumpMap	: texture,
        		bumpScale: 0.05,
        		emissiveMap	: texture,
        		emissive	: new THREE.Color('white'),
        	})
        );
        
        if( options.atmospheres )
        {
            var atmosphereOut	= THREEx.Planets.createAtmosphereMaterial()
            atmosphereOut.uniforms.glowColor.value.set(0xffffff)
            atmosphereOut.uniforms.coeficient.value	= 0.8
            atmosphereOut.uniforms.power.value		= 8.0
            var mesh	= new THREE.Mesh( sphere, atmosphereOut );
            mesh.scale.multiplyScalar(1.1);
            this.add( mesh );
            // new THREEx.addAtmosphereMaterial2DatGui(atmosphereOut, datGUI)
            
            var atmosphereIn	= THREEx.Planets.createAtmosphereMaterial()
            atmosphereIn.side	= THREE.BackSide
            atmosphereIn.uniforms.glowColor.value.set(0xffffff)
            atmosphereIn.uniforms.coeficient.value	= 0.5
            atmosphereIn.uniforms.power.value		= 8.0
            var mesh	= new THREE.Mesh( sphere, atmosphereIn );
            mesh.scale.multiplyScalar(1.15);
            this.add( mesh );
            // new THREEx.addAtmosphereMaterial2DatGui(atmosphereIn, datGUI)
        }
        
        if( options.flare )
        {
            // lens flares
			var textureLoader = new THREE.TextureLoader();

			var textureFlare0 = textureLoader.load( THREEx.Planets.baseURL+"lensflare/lensflare0.png" );
			var textureFlare2 = textureLoader.load( THREEx.Planets.baseURL+"lensflare/lensflare2.png" );
			var textureFlare3 = textureLoader.load( THREEx.Planets.baseURL+"lensflare/lensflare3.png" );

// 			addLight( 0.55, 0.9, 0.5, 5000, 0, -1000 );
// 			addLight( 0.08, 0.8, 0.5,    0, 0, -1000 );
// 			addLight( 0.995, 0.5, 0.9, 5000, 5000, -1000 );

// 			function addLight( h, s, l, x, y, z ) {

    // 			var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
    // 			light.color.setHSL( h, s, l );
    // 			light.position.set( x, y, z );
    // 			scene.add( light );

			var flareColor = new THREE.Color( 0xffffff );
// 			flareColor.setHSL( h, s, l + 0.5 );

			var lensFlare = this.lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

			lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
			lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
			lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

			lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
			lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

			lensFlare.customUpdateCallback = 
            function lensFlareUpdateCallback( object ) {

				var f, fl = object.lensFlares.length;
				var flare;
				var vecX = -object.positionScreen.x * 2;
				var vecY = -object.positionScreen.y * 2;


				for( f = 0; f < fl; f++ ) {

					flare = object.lensFlares[ f ];

					flare.x = object.positionScreen.x + vecX * flare.distance;
					flare.y = object.positionScreen.y + vecY * flare.distance;

					flare.rotation = 0;

				}

				object.lensFlares[ 2 ].y += 0.025;
				object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

			}
			lensFlare.position.set( 700000, 0, 0 );

			this.add( lensFlare );

        }
        
        if( options.emitLight )
        {
    	    var light = this.light = new THREE.PointLight( 0xffffff, 2, 0 );
            light.position.set( 0, 0, 0 );
            // scene.add( light );
        // 	var light	= new THREE.DirectionalLight( 0xffffff, 1 )
        // 	light.position.set(5,5,5)
        	light.castShadow	= true
        	light.shadow.camera.near	= 0.01
        	light.shadow.camera.far	= 15
        	light.shadow.camera.fov	= 45
        
        	light.shadow.camera.left	= -1
        	light.shadow.camera.right	=  1
        	light.shadow.camera.top	=  1
        	light.shadow.camera.bottom= -1
        	// light.shadowCameraVisible	= true
        
        	light.shadow.bias	= 0.001
        // 	light.shadow.darkness	= 0.2
        
        	light.shadow.mapSize.width	= 1024
        	light.shadow.mapSize.height	= 1024
    	    
        	this.add( light )
        }
    }
}


/**
 * from http://stemkoski.blogspot.fr/2013/07/shaders-in-threejs-glow-and-halo.html
 * @return {[type]} [description]
 */
THREEx.Planets.createAtmosphereMaterial	= function(){
	var vertexShader	= [
		'varying vec3	vVertexWorldPosition;',
		'varying vec3	vVertexNormal;',

		'void main(){',
		'	vVertexNormal	= normalize(normalMatrix * normal);',

		'	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

		'	// set gl_Position',
		'	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'}',

		].join('\n')
	var fragmentShader	= [
		'uniform vec3	glowColor;',
		'uniform float	coeficient;',
		'uniform float	power;',

		'varying vec3	vVertexNormal;',
		'varying vec3	vVertexWorldPosition;',

		'void main(){',
		'	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
		'	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
		'	viewCameraToVertex	= normalize(viewCameraToVertex);',
		'	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
		'	gl_FragColor		= vec4(glowColor, intensity);',
		'}',
	].join('\n')

	// create custom material from the shader code above
	//   that is within specially labeled script tags
	var material	= new THREE.ShaderMaterial({
		uniforms: { 
			coeficient	: {
				type	: "f", 
				value	: 1.0
			},
			power		: {
				type	: "f",
				value	: 2
			},
			glowColor	: {
				type	: "c",
				value	: new THREE.Color('pink')
			},
		},
		vertexShader	: vertexShader,
		fragmentShader	: fragmentShader,
		//blending	: THREE.AdditiveBlending,
		transparent	: true,
		depthWrite	: false,
	});
	return material
}




// radius 6371km
// THREEx.Planets.createEarth	= function(){
// 	var geometry	= new THREE.SphereGeometry(6371, 32, 32)
// 	var material	= new THREE.MeshPhongMaterial({
// 		map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/earthmap1k.jpg'),
// 		bumpMap		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/earthbump1k.jpg'),
// 		bumpScale	: 0.05,
// 		specularMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/earthspec1k.jpg'),
// 		specular	: new THREE.Color('grey'),
// 	})
// 	var mesh	= new THREE.Mesh(geometry, material)
// 	return mesh	
// }
THREEx.Planets.Earth = class Earth extends THREE.Mesh {
    constructor( options )
    {
        options = options || {};
        var sphere = new THREE.SphereGeometry(6371, 32, 32);
        sphere.scale( 1, 1-(1/578), 1 ); // Earth is flatten at poles so we scale along Y axis
        
        
        
        super(
            sphere,
            new THREE.MeshPhongMaterial({
        // 		map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthmap1k.jpg'),
        // 		map		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthmap16k.jpg'),
        		bumpMap		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthbump16k.jpg'),
        // 		bumpMap		: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthbump1k.jpg'),
        		bumpScale	: 200,
        		specularMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthspec1k.jpg'),
        // 		specularMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthspec8k.png'),
        		specular	: new THREE.Color('grey'),
        // 		emissiveMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'earthnight16k.jpg'),
        // 		emissive	: new THREE.Color( 0xFFFFAA ),
        // 		emissiveIntensity	: 0.5,
        	})
        );
        
        this.loader = new THREE.TextureLoader();
        this.highDefinition = !!options.HD;
        
        
        
        if( options.atmosphere )
        {
            var atmosphereOut	= THREEx.Planets.createAtmosphereMaterial()
            atmosphereOut.uniforms.glowColor.value.set(0x00b3ff)
            atmosphereOut.uniforms.coeficient.value	= 0.8
            atmosphereOut.uniforms.power.value		= 2.0
            this.atmosphereOut	= new THREE.Mesh( sphere, atmosphereOut );
            this.atmosphereOut.scale.multiplyScalar(1.01);
            this.add( this.atmosphereOut );
            // new THREEx.addAtmosphereMaterial2DatGui(atmosphereOut, datGUI)
            
            var atmosphereIn	= THREEx.Planets.createAtmosphereMaterial()
            atmosphereIn.side	= THREE.BackSide
            atmosphereIn.uniforms.glowColor.value.set(0x00b3ff)
            atmosphereIn.uniforms.coeficient.value	= 0.5
            atmosphereIn.uniforms.power.value		= 8.0
            this.atmosphereIn	= new THREE.Mesh( sphere, atmosphereIn );
            this.atmosphereIn.scale.multiplyScalar(1.15);
            this.add( this.atmosphereIn );
            // new THREEx.addAtmosphereMaterial2DatGui(atmosphereIn, datGUI)
            
            this._atmosphere = true;
        }
        
        if( options.clouds )
        {
            this.clouds	= new THREE.Mesh( sphere, THREEx.Planets.createEarthCloudMaterial() );
            // this.clouds	= THREEx.Planets.createEarthCloud()
            // this.clouds.receiveShadow	= true
            this.clouds.castShadow	= true
            this.clouds.scale.multiplyScalar(1.01)
            this.add( this.clouds )
            
        }
    }
    
    get highDefinition() { return !!this._highDefinition }
    set highDefinition( v )
    {
        this._highDefinition = v;
        this.loader.load(
            // THREEx.Planets.baseURL + (v?'earthmap16k.jpg':'earthmap1k.jpg'), 
            // THREEx.Planets.baseURL + (v?'earthmap16k.jpg':'earth_bath_3600x1800_color.jpg'), 
            THREEx.Planets.baseURL + 'earthmap_no_clouds_4k.jpg',
            // THREEx.Planets.baseURL + 'earthmap-blueprints.jpg',
            // THREEx.Planets.baseURL + 'earthmap-digital.jpg',
            // THREEx.Planets.baseURL + 'earthmap-geometric.jpg',
            // THREEx.Planets.baseURL + 'earthmap-grey.jpg',
            // THREEx.Planets.baseURL + 'earthmap-mesh.jpg',
            // THREEx.Planets.baseURL + 'earthmap-pencil.jpg',
            // THREEx.Planets.baseURL + 'earthmap-rusty.jpg',
            // THREEx.Planets.baseURL + 'earthmap-water-colour.jpg',
            
            texture => { this.material.map = texture; this.material._needsUpdate = true }
		);
		this.loader.load(
            THREEx.Planets.baseURL + (v?'earthspec8k.jpg':'earthspec1k.jpg'), 
            texture => { this.material.specularMap = texture; this.material._needsUpdate = true }
		);
		
		if( v )
		{
		    this.loader.load(
                // THREEx.Planets.baseURL+'dnb_land_ocean_ice.2012.13500x6750.jpg', 
                // THREEx.Planets.baseURL+'earth_lights.gif', 
                THREEx.Planets.baseURL+'earth_bath_3600x1800_color.jpg', 
                // THREEx.Planets.baseURL+'earthnight16k.jpg', 
                texture => {
    		        this.material.emissiveMap = texture;
            		this.material.emissive = new THREE.Color( 0xFFFFAA );
            		this.material.emissiveIntensity	= 0.5;
                    this.material._needsUpdate = true
                    
                }
    		);
		}
    }
    
    
    get atmosphere() { return !!this._atmosphere }
    set atmosphere( v )
    {
        this._atmosphere = 
        this.atmosphereIn.visible = 
        this.atmosphereOut.visible = v;
    }
    
    
    
    animate( delta, now )
    {
        this.rotation.y += 1/32 * delta;
        this.clouds.rotation.y += 1/320 * delta;		
    }
}


THREEx.Planets.createEarthCloud	= function(){
	// create destination canvas
	var canvasResult	= document.createElement('canvas')
	canvasResult.width	= 1024
	canvasResult.height	= 512
	var contextResult	= canvasResult.getContext('2d')		

	// load earthcloudmap
	var imageMap	= new Image();
	imageMap.addEventListener("load", function() {
		
		// create dataMap ImageData for earthcloudmap
		var canvasMap	= document.createElement('canvas')
		canvasMap.width	= imageMap.width
		canvasMap.height= imageMap.height
		var contextMap	= canvasMap.getContext('2d')
		contextMap.drawImage(imageMap, 0, 0)
		var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

		// load earthcloudmaptrans
		var imageTrans	= new Image();
		imageTrans.addEventListener("load", function(){
			// create dataTrans ImageData for earthcloudmaptrans
			var canvasTrans		= document.createElement('canvas')
			canvasTrans.width	= imageTrans.width
			canvasTrans.height	= imageTrans.height
			var contextTrans	= canvasTrans.getContext('2d')
			contextTrans.drawImage(imageTrans, 0, 0)
			var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
			// merge dataMap + dataTrans into dataResult
			var dataResult		= contextMap.createImageData(canvasMap.width, canvasMap.height)
			for(var y = 0, offset = 0; y < imageMap.height; y++){
				for(var x = 0; x < imageMap.width; x++, offset += 4){
					dataResult.data[offset+0]	= dataMap.data[offset+0]
					dataResult.data[offset+1]	= dataMap.data[offset+1]
					dataResult.data[offset+2]	= dataMap.data[offset+2]
					dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]
				}
			}
			// update texture with result
			contextResult.putImageData(dataResult,0,0)	
			material.map.needsUpdate = true;
		})
		imageTrans.src	= THREEx.Planets.baseURL+'earthcloudmaptrans.jpg';
	}, false);
	imageMap.src	= THREEx.Planets.baseURL+'earthcloudmap.jpg';

	var geometry	= new THREE.SphereGeometry(6371, 32, 32)
	var material	= new THREE.MeshPhongMaterial({
		map		: new THREE.Texture(canvasResult),
		side		: THREE.DoubleSide,
		transparent	: true,
		opacity		: 0.8,
	})
	var mesh	= new THREE.Mesh(geometry, material)
	return mesh	
}
THREEx.Planets.createEarthCloudMaterial	= function(){
	// create destination canvas
	var canvasResult	= document.createElement('canvas')
	canvasResult.width	= 1024
	canvasResult.height	= 512
	var contextResult	= canvasResult.getContext('2d')		

	// load earthcloudmap
	var imageMap	= new Image();
	imageMap.addEventListener("load", function() {
		
		// create dataMap ImageData for earthcloudmap
		var canvasMap	= document.createElement('canvas')
		canvasMap.width	= imageMap.width
		canvasMap.height= imageMap.height
		var contextMap	= canvasMap.getContext('2d')
		contextMap.drawImage(imageMap, 0, 0)
		var dataMap	= contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height)

		// load earthcloudmaptrans
		var imageTrans	= new Image();
		imageTrans.addEventListener("load", function(){
			// create dataTrans ImageData for earthcloudmaptrans
			var canvasTrans		= document.createElement('canvas')
			canvasTrans.width	= imageTrans.width
			canvasTrans.height	= imageTrans.height
			var contextTrans	= canvasTrans.getContext('2d')
			contextTrans.drawImage(imageTrans, 0, 0)
			var dataTrans		= contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height)
			// merge dataMap + dataTrans into dataResult
			var dataResult		= contextMap.createImageData(canvasMap.width, canvasMap.height)
			for(var y = 0, offset = 0; y < imageMap.height; y++){
				for(var x = 0; x < imageMap.width; x++, offset += 4){
					dataResult.data[offset+0]	= dataMap.data[offset+0]
					dataResult.data[offset+1]	= dataMap.data[offset+1]
					dataResult.data[offset+2]	= dataMap.data[offset+2]
					dataResult.data[offset+3]	= 255 - dataTrans.data[offset+0]
				}
			}
			// update texture with result
			contextResult.putImageData(dataResult,0,0)	
			material.map.needsUpdate = true;
		})
		imageTrans.src	= THREEx.Planets.baseURL+'earthcloudmaptrans.jpg';
	}, false);
	imageMap.src	= THREEx.Planets.baseURL+'earthcloudmap.jpg';

// 	var geometry	= new THREE.SphereGeometry(6371, 32, 32)
	var material	= new THREE.MeshPhongMaterial({
		map		: new THREE.Texture(canvasResult),
		side		: THREE.DoubleSide,
		transparent	: true,
		opacity		: 0.8,
	})
// 	var mesh	= new THREE.Mesh(geometry, material)
	return material	
}

// radius 1737km, distance: 384400km
// THREEx.Planets.createMoon	= function(){
// 	var geometry	= new THREE.SphereGeometry(1737, 32, 32)
// 	var material	= new THREE.MeshPhongMaterial({
// 		map	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/moonmap1k.jpg'),
// 		bumpMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'images/moonbump1k.jpg'),
// 		bumpScale: 0.002,
// 	})
// 	var mesh	= new THREE.Mesh(geometry, material)
// 	return mesh	
// }
THREEx.Planets.Moon = class Moon extends THREE.Mesh {
    constructor()
    {
        super(
            new THREE.SphereGeometry(1737, 32, 32),
            new THREE.MeshPhongMaterial({
        		map	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'moonmap1k.jpg'),
        		bumpMap	: THREE.ImageUtils.loadTexture(THREEx.Planets.baseURL+'moonbump1k.jpg'),
        		bumpScale: 0.002,
        	})
        );
    }
}

THREEx.Planets.EarthMarker = class EarthMarker extends THREE.Object3D {
    
    constructor( lat, lon )
    {
        super();
        // marker object
        var pointer = this.pointer = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0, 2, 16),
                new THREE.MeshPhongMaterial({color: 0x00EE00})
            );
        pointer.geometry.translate(0,1,0);
        pointer.rotation.z = -Math.PI/2;
        // pointer.position.set(1, 0, 0); // rotating obj should set (X > 0, 0, 0)
        pointer.scale.multiplyScalar(6371/10);
        pointer.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0));
        
        var pos = new THREE.Object3D();
        pos.add(pointer);
        pos.position.x = 6371;
        
        this.add(pos);
        
        if( lat && lon )
            this.coordinates = { latitude: lat, longitude: lon };
    }
    
    set coordinates( v )
    {
        var rad = Math.PI / 180;
        this.quaternion.setFromEuler( new THREE.Euler(0, v.longitude * rad, v.latitude * rad, "YZX") );
                
    }
    
    set latitude( v )
    {
        
    }
    
    set longitude( v )
    {
        
    }
}


THREEx.Planets.systems = {};
THREEx.Planets.SolarSystem = THREEx.Planets.systems.Solar = class SolarSystem extends THREE.Scene {
    
    constructor( planets )
    {
        super();
        
        this.container = new THREE.Object3D();
        this.container.scale.multiplyScalar(1/36.71);
        this.add( this.container );
        
        this.camera = this.defaultCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000000000 );
		this.camera.position.z = 400;
        this.add( this.camera );
        
        // LIGHTS
        this.ambient = new THREE.AmbientLight( 0xFFFFFF );
        this.ambient.visible = false;
        this.add( this.ambient );
        
        
    	if( 'stars' in planets )
    	{
    	    this.stars	= new THREEx.Planets.Starfield( 9000000 )
        	this.add( this.stars )
    	}
    	
    	if( 'sun' in planets )
    	{
    	    
    	    this.sun	= new THREEx.Planets.Sun({
    	        atmosphere: true,
    	        emitLight: true,
    	        flare: true
    	    })
        	this.sun.position.set(0,0,0)
        // 	this.sun.receiveShadow	= true
        // 	this.sun.castShadow	= true
        	this.container.add( this.sun );
    	}
    	
    	if( 'moon' in planets )
    	{
        	this.moon	= new THREEx.Planets.Moon()
        	this.moon.position.set(384400,0,0)
        	this.moon.receiveShadow	= true
        	this.moon.castShadow	= true
        	this.container.add( this.moon )
    	}
    	
    	if( 'earth' in planets )
    	{
        	this.earth	= new THREEx.Planets.Earth({
        	    atmosphere: true,
        	    clouds: true,
        	   // HD: true
        	})
        	this.earth.position.set(149600000/10,0,0)//149600000/50 + 20 000 000
        // 	this.earth.rotateZ(-23.4 * Math.PI/180)
        // 	this.earth.receiveShadow	 = true
        // 	this.earth.castShadow	 = true
        // 	this.earth.clouds.material.opacity = 1
        	this.container.add( this.earth )
        	
        	this.earth.add(
    	        this.earth.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000000000 )
    	    )
    	    this.earth.camera.rotation.y = Math.PI / 2;
    	    this.earth.camera.position.x = 6371*5;
    	}
    	
    	if( this.referencial && this.referencial.camera )
        {
            controls.object = this.camera = this.referencial.camera;
        }
    }
    
    
    
    animate( e )
    {
        this.earth.animate( e.deltaMsec/1000, e.nowMsec/1000 );
        
        if( this.referencial && this.referencial.camera )
        {
            controls.object = this.camera = this.referencial.camera;
            // this.position.copy( this.referencial.position.clone().negate() );
            // system.position.copy(system.earth.position.clone().negate())
            
            // var pos = this.referencial.position.clone().negate().multiply( this.container.scale );
            // this.container.position.copy( pos );
            
            // var rot = this.referencial.rotation.clone().toVector3();
            // rot.negate();
            // this.container.rotation.set( -rot.x, -rot.y, -rot.z );
            // this.stars && this.stars.rotation.set( -rot.x, -rot.y, -rot.z );
//             this.referencial
//             camera.position.x = Math.sin( system.earth.rotation.y ) * 1000;
// 			camera.position.z = Math.cos( system.earth.rotation.y ) * 1000;
// 			camera.lookAt( system.earth.position );
        }
    }
}



