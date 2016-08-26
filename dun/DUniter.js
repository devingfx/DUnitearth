/* globals EventTarget, THREE */
"use strict";

Object.merge = function( a,b )
{
    Object.getOwnPropertyNames( b ).map( n => a[n] = b[n] )    
};

function GET( url, cb )
{
    if( localStorage[url] )
        return setTimeout( cb, 1, JSON.parse(localStorage[url]) );
    
    var loader = new XMLHttpRequest();
    loader.addEventListener( 'load', e=> cb( JSON.parse(localStorage[url] = e.target.response) ) );
    loader.open( 'GET', url );
    loader.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
    loader.setRequestHeader( "Accept", "application/json" );
    loader.send();
}






class Peer extends THREE.EventDispatcher {
    constructor( options )
    {
        super();
        
        Object.merge( this, options );
        
        if( options.endpoints )
            this.endpoints = options.endpoints.map( s => {
                var v = s.split(' ');
                return {
                    type: v[0],
                    domain: v[1],
                    ip: v[2],
                    port: v[3],
                    url: 'http://' + v[2] + ':' + v[3] + '/',
                }
            })
            .map( o => {
                this.localize( o )
                return o
            })
    }
    
    load()
    {
        
    }
    
    localize( endpoint )
    {
        if( endpoint.ip && /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(endpoint.ip) )
            GET( 'http://ipinfo.io/' + endpoint.ip, d => {
                if( !d.loc ) return;
                var c = d.loc.split(',');
                endpoint.location = d;
                endpoint.location.latitude = c[0];
                endpoint.location.longitude = c[1];
                var e = new Event('locationFound');
                e.endpoint = endpoint;
                e.peer = this;
                this.dispatchEvent( e );
            } )
    }
}

class Blockchain extends THREE.EventDispatcher {
    constructor()
    {
        super();
        
        this._peerClass = Peer;
        
        this.peers = [];
    }
    
    addPeer( data )
    {
        // TODO: new du.Peer()
        var peer = new this._peerClass( data );
        peer.blockchain = this;
        this.peers.push( peer );
        
        var e = new Event('peerAdded');
        e.peer = peer;
        this.dispatchEvent( e );
    }
    
    removePeer()
    { /* TODO */ }
    
    load( path, cb )
    {
        // TODO: peers.map( p => p.load( path, cb ) )
        var url = this.peers[0].url + path;
        
        if( localStorage[url] )
            return setTimeout( cb, 1, JSON.parse(localStorage[url]) );
        
        var loader = new XMLHttpRequest();
        loader.addEventListener( 'load', e => cb( JSON.parse(localStorage[url] = e.target.response) ) );
        loader.open( 'GET', url );
        loader.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
        loader.setRequestHeader( "Accept", "application/json" );
        loader.send();
    }
}

class DUniterBlockchain extends Blockchain {
    constructor( url )
    {
        super();
        this.addPeer( {url: url} );
        this.certifications = [];
        
        // TODO: a peers management with data consolidation, lets see in v2.O ^^
        this.load( 'network/peers', data => 
            // data.peers.map( P => this.addPeer(P) ) 
            this.dispatchEvent( new CustomEvent('peersLoaded', {detail: 
                (data.peers.map(P => this.addPeer(P)), 
                this.peers) // Just this line goes into detail {foo: (0,1,2,3,4)} >> foo == 4
            }))
        );
        
        // Get currency params
        this.load( 'blockchain/parameters', data => 
            this.dispatchEvent( new CustomEvent('parametersLoaded', {detail: (this.parameters = data)}) )
        );
    }
}
DUniterBlockchain.AUTOLOAD_MEMBER_CERTIFICATIONS = false;




