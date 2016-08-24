"use strict";

// Object.defineProperty( Element.prototype, 'Class', {
Object.defineProperties( Element.prototype, {
    'Class': {
        get: function()
        {
            try {
                if( document.isHTML )
                    return eval( this.localName
                                    .replace(/\:(.)/g, (s,$1) => "."+$1.toUpperCase())
                                    .replace(/\-(.)/g, (s,$1) => $1.toUpperCase())
                            )
                return eval(
                    this.namespaceURI == 'http://www.w3.org/1999/xhtml'
                     ? `HTML${this.localName[0].toUpperCase()+this.localName.substring(1).toLowerCase()}Element`
                     : this.namespaceURI.replace('*', this.localName)
                );
            } catch(e){}
            // try {
            //     return eval( 
            //         this.namespaceURI == 'http://www.w3.org/1999/xhtml'
            //          ? `HTML${this.localName[0].toUpperCase()+this.localName.substring(1).toLowerCase()}Element`
            //          : this.namespaceURI.replace('*', this.localName)
            //     );
            // } catch(e){}
        },
        set: function( v )
        {
            if( typeof v == 'function' && v.prototype instanceof Element )
                Object.setPrototypeOf(this, v.prototype)[v.name]()
        }
    },
    // 'namespace': {
    //     get: function()
    //     {
    //         var o = 'window.' + this.namespaceURI.replace('*','');
    //         o = o.substr( 0, o.length-1 );
    //         return eval( o );
    //     }
    // }
});

// Attr.BINDING_REG = /^\{(.*)\}$/;
// Object.defineProperty( Attr.prototype, 'value', {
//     get: function()
//     {
//         if( this._value ) return this._value;
        
//         var _attr = this;
//         if( Attr.BINDING_REG.test( this.nodeValue ) )
//         {
//             // this._value = 0[0]; // undefined
//             try
//             {
//                 // this._value = eval('('+this.value.substr(1, this.value.length-2)+')');
//                 this._value = eval('('+Attr.BINDING_REG.exec( this.nodeValue )[1]+')');
//             } catch(e) {}
//         }
//         else if( this.name.indexOf('on') === 0 )
//         {
//         	this.ownerElement._target && 
//     			this.ownerElement._target.addEventListener( this.name.substring(2), function(e)
//     			{
//     				eval('(function(){' + (_attr.value || '') + '})').call( this, e );
//     			});
//         }
//         else
//         {
//             var val = this.nodeValue,
//                 int = parseInt( val ),
//                 flo = parseFloat( val ),
//                 isHex = val.indexOf('0x') == 0,
//                 nul = val == 'null',
//                 undef = val == 'undefined',
//                 isTrue = val == 'true',
//                 isFalse = val == 'false';
//             //this._name = this.name;
//     		this._value = isHex ? int : !isNaN(flo) ? flo : val;
    		
//     		if(isTrue||isFalse) this._value = isTrue;
//     		if(nul) this._value = null;
//     		if(undef) this._value = 0[0];
    
//             //this._value = isHex ? int : flo || val;
//         }
//     	return this._value;
//     },
//     set: function( v )
//     {
//         if( this.nodeValue != v ) 
//         {
//             var old = this.nodeValue;
//             this.nodeValue = v;
//             delete this._value;
//             this.dispatchEvent( new CustomEvent('nodeValueChanged', {detail:
//                 { oldValue: old, newValue: v }
//             }) )
//         }
//     }
// });






// Object.defineProperty( Attr.prototype, 'nodeValue', {
//     get: function()
//     {
//         return super.nodeValue;
//     },
//     set: function( v )
//     {
//         super.nodeValue = v;
//         delete this._value;
//         this.dispatchEvent( new CustomEvent('valueChanged')  )
//     }
// });
// Attr.prototype.binding = function()
// {
//     this.nodeValue
// };
// Attr.prototype.commitProperty = function()
// {
//     var target = this.ownerElement._target || this.ownerElement;
//     eval('target.' + this.name +' = this.value;');
// };
// Attr.prototype.applyTo = function( target )
// {
//     eval('target.' + this.name +' = this.value;');
// };

document.addEventListener('DOMContentLoaded', e => 
    Array.from( document.querySelectorAll('three\\:renderer') )
//         .filter( node => node.namespaceURI == 'THREE.Elements.*' )
        .map( node => node.Class = THREE.Elements.Renderer )
);


var THREE = THREE || {};
window.three = THREE.Elements = {};

function conv( s )
{
    
    return s
    .replace(/\:(.)/g, (s,$1) => "."+$1.toUpperCase())
    .replace(/\-(.)/g, (s,$1) => $1.toUpperCase())

}

conv( "three:orbit-controls" ) // "three.OrbitControls

document.isXHTML = document.constructor == XMLDocument;
document.isHTML = document.constructor == HTMLDocument;

/**
 * THREEElement Class
 */
THREE.Elements.Element = class Element extends window.HTMLElement {
	static get className() { return 'Element' }
	constructor( klass )
    {
        klass = klass || 'Element';
        var node = document.createElementNS( 'THREE.Elements.*',`THREE:${klass}` );
        Object.setPrototypeOf( node, THREE.Elements[klass].prototype );
        node[klass]();
        return node;
    }
	Element()
	{
		this._constructorArgs = [];
		
		this._target = this.toTHREEObject();
// 		if( this._target )
// 		this._target = new Proxy( this.toTHREEObject(), {
//             set: function( obj, prop, value )
//             {
//                 console.log( arguments );
//                 // Le comportement par défaut : enregistrer la valeur
//                 obj[prop] = value;
//             }
//         })
		
		this._proxy = new Proxy( this, {
            get: function( obj, prop )
            {
                console.log( 'get! ', arguments );
                // Avoid recursive loop
                if( prop == '_target' )
                    return obj._target;
                
                return obj._target[prop];
            },
            set: function( obj, prop, value )
            {
                console.log( 'set! ', arguments );
                // Le comportement par défaut : enregistrer la valeur
                obj._target[prop] = value;
            }
        })
		
		this.addEventListener('childAdded', this.onChildAdded.bind(this));
		
		if(this.id !== '')
			eval('window.'+this.id+' = this._proxy;');
		
// 		this._setPropertiesFromAttributes();
		
		Array.from( this.children )
		    .map( child => this.dispatchEvent(new CustomEvent('childAdded',{detail: {child:child}})) )
		
		return this._proxy;
	}
// 	setAttribute( name, value )
// 	{
// 	   // if( this.attributes[name] )
// 	    super.setAttribute( name, value );
// 	    delete this.attributes[name]._value
// 	    this.attributes[name].commitProperty()
// 	}
// 	_setPropertiesFromAttributes()
// 	{
// 		Array.from( this.attributes ).map( attr => 
// 		{
// 			if( this._constructorArgs.indexOf( attr.name ) == -1 
// 				&& THREE.Elements.Element.avoidAttribute.indexOf( attr.name ) == -1)
// 				{
// 				// 	attr.parse();
// 				    // attr.addEventListener('valueChanged', e => ( this._target || this ))
// 					attr.commitProperty();
// 				}
// 		});
// 	}
	onChildAdded( e )
	{
		var child = e.detail.child;
		if( child.nodeType == 1 )
		{
			!child._target
			 && child.namespaceURI == 'THREE.Elements.*'
			 && (child.Class = THREE.Elements.Element)
			 && child.Class.THREEElement()
			 && child._setAttributes();
			
			if( child._target instanceof THREE.Object3D)
			{
				//child._target = child.toTHREEObject();
				this._target.add( child._target );
			}
		}
	}
	toTHREEObject()
	{
		var node = this, klass = THREE[this.Class.className];
		
		if( klass )
		{
			var constructorArgs = this._constructorArgs = klass.toString()
									.match(/function(.*?)\(\s*(.*?)\s*\)/)[2]
									.split(/\s*,\s*/),

				attrs = Array.from( node.attributes )
						.map(function( attr )
						{
							 attr.parse();
						}),

				args = constructorArgs
						.filter(function( a )
						{
							return a != '';
						})
						.map(function( name )
						{
							name = klass.min ? klass.min[name] : name;
							//var att = attrs.filter(function(){return this._name == name; })[0];
							var att = node.attributes[name];
							return att ? att._value : 0[0];
							//return (node.attributes[name] || {_value: 0[0]})._value;
						});

			//var obj3D = Object.create(klass.prototype);
			var obj3D = eval('(new klass( '+args.map(function(o,i){return'args['+i+']'}).join(',')+') )');
			//var ret = klass.apply( obj3D, args );
			//ret && (obj3D=ret);

			
			
			/*
			$( node ).children().each(function()
			{
				debugger;
				this.toTHREEObject && obj3D.add( this.toTHREEObject() );
			});
			*/
			//console.emit(/instance/, 'log', obj3D);
			return obj3D;
		}
	}
};
THREE.Elements.Element.avoidAttribute = 'id style class'.split(' ');

[	'Camera',
	'PerspectiveCamera', 
	'Scene',
	'AmbientLight',
	'PointLight',
	'DirectionalLight',
	'OrbitControls',
	'Fog',
	'Mesh',
	'Object3D',
	'Cube'
].map( n => {
	THREE.Elements[n] = class extends THREE.Elements.Element {
	    static get name() { return n }
	    constructor()
	    {
	        super( n );
	    }
	    [n]()
	    {
	        super.Element();
	        console.log(n);
	    }
	};
})





THREE.Elements.Renderer = class Renderer extends THREE.Elements.Element {
    constructor()
    {
        super( 'Renderer' );
    }
    
    Renderer()
    {
        this.Element();
        
        this.frame = 0;
        this._target = 
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.hasAttribute('antialias') ? this.getAttribute('antialias') == 'true' : true,
            alpha: true
        });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.sortObjects = false;
		this.renderer.shadowMapEnabled = true;

		// this.renderer.gammaInput = true;
		// this.renderer.gammaOutput = true;

		this.appendChild( this.renderer.domElement );
		
		
		
		
		
		this.hasAttribute('auto-render')
		 && this.getAttribute('auto-render') == 'true'
		 && requestAnimationFrame( this.animate.bind(this) );
		
		window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
		
		Array.from( this.querySelectorAll('script[type^="event/"]') )
		    .map( n => {
		        var ev = n.type.replace('event/','');
		        this[ev] = this[ev] || [];
		        this[ev].push( new Function('event', n.innerText) )
		    })
		
		
		
        // Mouse
        
// 		this.domElement.addEventListener( 'touchstart', this.onDocumentTouchStart.bind(this), false );
// 		this.domElement.addEventListener( 'mousemove', this.onDocumentMouseMove.bind(this), false );
// 		this.domElement.addEventListener( 'mousedown', this.onDocumentMouseDown.bind(this), false );
// 		this.domElement.addEventListener( 'mouseup', this.onDocumentMouseUp.bind(this), false );
		
		// Stats

		this.stats = new Stats();
		this.stats.dom.style.cssText = "position:fixed;bottom:0;right:0;cursor:pointer;opacity:0.9;z-index:10000";
		this.appendChild( this.stats.dom );
		
		this.onReady && this.onReady.map( fn => fn({renderer: this}) );
    }
    
    onWindowResize()
    {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}
	
    get domElement() { return this.renderer.domElement }
    
    animate( nowMsec )
	{
        // measure time
		this.lastTimeMsec	= this.lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - this.lastTimeMsec)
		this.lastTimeMsec	= nowMsec
		
		this.onAnimate && this.onAnimate.map( fn => fn({
		    deltaMsec: deltaMsec,
		    nowMsec: nowMsec,
		    renderer: this
		}));
		
        // earth.animate( deltaMsec/1000, nowMsec/1000 );
        
        // test_net.animate();
        // dune.animate();
        

        
//         TWEEN.update();
		this.stats.update();
		this.render();

		requestAnimationFrame( this.animate.bind(this) );
	}
	
	render()
	{
		this.frame ++;
		var time = Date.now() * 0.001;
        
        this.onRender && this.onRender.map( fn => fn({renderer: this}) );
        
		this.renderer.render( this.scene, this.camera || this.scene.camera );

	}
    
}
THREE.Elements.Renderer.tagName = 'three-renderer';


