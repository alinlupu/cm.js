/*
 * Creates html element container based on type:
 * 0 - GENERAL, 
 * 1 - SVG,
 * 2 - CANVAS2D,
 * 3 - CANVAS3D
*/
const Container = function() {
	var _w = 0;
	var _h = 0;
	var _x = 0;
	var _y = 0;
	var _type = 0;
	var _id = "";
	var _ctx = null;
	var _el = null;
	var _pel = null;
	var _flippable = 1;
	
	const createElement = () => {
		let _svgNS = "http://www.w3.org/2000/svg";
		let elexists = document.getElementById( _id );
		if( elexists ) {
			_el = elexists;	
		} else {
			switch( _type ) {
				case 0:
					_el = document.createElement( "div" );
					break;
				case 1:
					_el = document.createElementNS( _svgNS, "svg" );
					break;
				case 2:
					_el = document.createElement( "canvas" );
					_ctx = _el.getContext( "2d" );
					break;
				case 3:
					_el = document.createElement( "canvas" );
					_ctx = _el.getContext( "3d" );
					break;
				default:
					console.log( "[create-container-element] Container type not recognized" );
					return null;
			}
			_el.id = _id;
		}	
		_el.style.visibility = "hidden";
		_el.style.position = "absolute";
	}
	const updateElement = () => {
		let calcw = _w;
		let calch = _h;
		let calcy = _y;
		let calcx = _x;
		if( ( _w.a || _w.b ) && _w.x ) {
			calcw = _w.a * _w.x + _w.b;	
		}
		if( ( _h.a || _h.b ) && _h.x ) {
			calch = _h.a * _h.x + _h.b;	
		}
		if( ( _y.a || _y.b ) && _y.x ) {
			calcy = _y.a * _y.x + _y.b;	
		}
		if( ( _x.a || _x.b ) && _x.x ) {
			calcx = _x.a * _x.x + _x.b;	
		}

		let	wstr = `${ calcw }px`;
		let hstr = `${ calch }px`;
		let xstr = `${ calcx }px`;
		let ystr = `${ calcy }px`;
		if( _type == 0 || _type == 1 ) {
			_el.style.width = wstr;
			_el.style.height = hstr;
		} else {
			_el.width = _w;
			_el.height = _h;
		}
		_el.style.left = xstr;
		_el.style.top = ystr;
	}

	this.init = ({
		id = "",
		type = 0,
		width = 300,
		height = 300,
		x = 10,
		y = 10,
		flippable = 1,
		parentEl = document.body
	}) => {
		_w = width;
		_h = height;
		_x = x;
		_y = y;
		_type = type;
		_pel = parentEl;
		_id = id;
		_flippable = flippable;
		createElement();
		updateElement();		
		if( _pel ) {
			_pel.appendChild( _el );
		}
	}
	
	this.update = ({
		width = _w,
		height = _h,
		x = _x,
		y = _y
	}={}) => {
		if( width.x && !width.a && !width.b ) {
			_w.x = width.x;
		} else {
			_w = width;
		}

		if( height.x && !height.a && !height.b ) {
			_h.x = height.x;
		} else {
			_h = height;
		}
		
		if( x.x && !x.a && !x.b ) {
			_x.x = x.x;
		} else {
			_x = x;
		}
		
		if( y.x && !y.a && !y.b ) {
			_y.x = y.x;
		} else {
			_y = y;
		}

		updateElement();
	}

	this.flip = () => {
		if( _flippable ) {	
		/*
			let vb = _el.getAttribute( "viewBox")
			if( vb ) {
				vb = vb.split( ' ' );	
				_el.setAttribute( "viewBox", `${vb[0]} ${vb[1]} ${vb[3]} ${vb[2]}` );
				console.log( _el.getAttribute( "viewBox" ) );
			}
			*/
			this.update({
				width: _h,
				height: _w,
				x: _y,
				y: _x
			});
		}
	}

	this.getId = () => {
		return _id;
	}

	this.render = ({
		drawFunc = null		
	}={}) => {
		_el.style.visibility = "visible";
		if( _type > 1 ) drawFunc( _ctx );
	}
}

const ContainerManager = function() {
	var _width = 0;
	var _height = 0;
	var _containers = [];
	
	this.flipped = false;
	this.create = ( width, height ) => {
		_width = width;
		_height = height;	
	}
	this.addContainer = ( params ) => {
		let container = new Container();
		if( !params.width ) params.width = _width;
		if( !params.height ) params.height = _height; 
		container.init( params );
		container.render({ drawFunc: params.drawFunc });
		_containers.push( container );
	}
	this.flip = () => {
		this.flipped = !this.flipped;
		_containers.forEach( (c) => {
			c.flip();
		});
	}
	this.resize = ({
		id = null,
		new_x = null,
		new_y = null,
		new_w = null,
		new_h = null,
		}) => {
		
		_containers.forEach( (c) => {
			if( id && c.getId() == id ) {
				if( new_x ) c.update({ x: new_x }); 
				if( new_y ) c.update({ y: new_y }); 
				if( new_w ) c.update({ width: new_w }); 
				if( new_h ) c.update({ height: new_h }); 
			}
		});
	}
	this.resizeAll = ({
		width = 0, 
		height = 0 }) => {
		
		_containers.forEach( (c) => {
			c.update({
				x: { x: width },
				y: { x: height },
				width: { x: width },
				height: { x: height }
			})
		})
	}
}

const LayoutManager = function() {
	this.resizeFunc = null;
	this.initSize = () => {
		let win = window,
			doc = document,
			docElem = doc.documentElement,
			body = doc.getElementsByTagName('body')[0],
			userAgent = navigator.userAgent || navigator.vendor || window.opera,
			x =  win.innerWidth || docElem.clientWidth || body.clientWidth,
			y =  win.innerHeight || docElem.clientHeight|| body.clientHeight;
		
		if ( /android/i.test( userAgent )) {
			//x = win.screen.width;
			//y = win.screen.height;
		}

		this.width = x;
		this.height = y;
	}
	this.resize = () => {
		this.initSize();
		if( this.resizeFunc ) this.resizeFunc();
		document.body.onresize = this.resize;
	}
	this.initSize();
}

var lm = new LayoutManager();
var cm = new ContainerManager();

cm.create( lm.width, lm.height );

/*
 * EXAMPLES
let draw = ( ctx ) => {
	ctx.fillStyle = "#000500";
	ctx.fillRect( 0, 0, parseInt( ctx.canvas.width ), parseInt( ctx.canvas.height ));
}
*/
/*
cm.addContainer({ 
	id: "main-container-CANVAS",
	type: 2,
	width: lm.width - 20,
	height: lm.height - 20,
	drawFunc: draw
});
*/

lm.resizeFunc = () => {
	cm.resizeAll({ width: lm.width, height: lm.height });
}
document.body.onresize = lm.resize;
