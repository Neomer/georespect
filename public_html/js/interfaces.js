class Brush {
    constructor() {
        this.c = '#880000bb';
        this.w = 3;
        this.c2 = '#bb0000bb'
    }
    
    get color() {
        return this.c;
    }
    
    set color(val) {
        this.c = val;
    }
    
    get colorHex() {
        return this.c.substr(0, this.c.length - 2);
    }

    get colorA() {
        return parseInt(this.c.substr(this.c.length - 2, 2), 16);
    }
    
    get width() {
        return this.w;
    }
    
    set width(val) {
        this.w = val;
    }
    
    get fillcolor() {
        return this.c2;
    }
    
    get fillcolorHex() {
        return this.c2.substr(0, this.c.length - 2);
    }
    
    get fillcolorA() {
        return parseInt(this.c2.substr(this.c2.length - 2, 2), 16);
    }

    set fillcolor(val) {
        this.c2 = val;
    }
}
class IMap {
    constructor(div) {
        this.d = div;
        this.b = new Brush();
        this.p = null;
        this.activeMenu = null;
    }
    
    setMenu(m) {
        printTrace('IMap::setMenu(m)');
        this.activeMenu = m;
    }
    
    getMenu() { 
        printTrace('IMap::getMenu()');
        return this.activeMenu;
    }
    
    closeMenu() {
        printTrace('IMap::closeMenu()');
        if (this.activeMenu !== null && this.activeMenu !== 'undefined')
        {
            this.activeMenu.close();
        }
    }

    get div() {
        return this.d;
    }
    get currentElement() {
        return this.e;
    }
    
    set currentElement(obj) {
        this.e = obj;
    }

    setObject(obj)
    {
        this.p = obj;
    }
    
    getObject()
    {
        return this.p;
    }
    
    get brush() {
        return this.b;
    }
    
    set brush(val) {
        this.b = val;
    }
    

    initialize() {
        throw new Error("Calling method initialize() of abstract class IMap!");
    }
    
    destroy() {
        throw new Error("Calling method destroy() of abstract class IMap!");
    }
    
    createPolygon() {
        throw new Error("Calling method createPolygon() of abstract class IMap!");
    }
    
    get center() {
        throw new Error("Calling method center() of abstract class IMap!");
    }
    
    set center(coords) {
        throw new Error("Calling method center() of abstract class IMap!");
    }
    
    geocode(map, address) {
        throw new Error("Calling method geocode() of abstract class IMap!");
    }
    
    placeText() {
        throw new Error("Calling method placeText() of abstract class IMap!");
    }
    placePolygon() {
        throw new Error("Calling method placePolygon() of abstract class IMap!");
    }
    placePolyline() {
        throw new Error("Calling method placePolyline() of abstract class IMap!");
    }
    
    scale2000() {
        throw new Error("Calling method scale2000() of abstract class IMap!");
    }
    
    scale5000() {
        throw new Error("Calling method scale5000() of abstract class IMap!");
    }
    
    scale10000() {
        throw new Error("Calling method scale10000() of abstract class IMap!");
    }
    
    get zoom() {
        throw new Error("Calling method zoom() of abstract class IMap!");
    }
    
}    
class IGeoCoder {
    constructor() {
        
    }
    
    find(map, address) {
        throw new Error("Calling method find() of abstract class IGeoCoder!");
    }
}
class IGeoObject {
    constructor(map, object) {
        printTrace('IGeoObject::IGeoObject()');
        this.i = object;
        this.m = map;
    }
    
    get map() {
        return this.m;
    }

    get instance() {
        return this.i;
    }
    
    enableEditting() {
        throw new Error("Calling method enableEditting() of abstract class IGeoObject!");
    }

    disableEditting() {
        throw new Error("Calling method disableEditting() of abstract class IGeoObject!");
    }
    
    show() {
        throw new Error("Calling method show() of abstract class IGeoObject!");
    }
    
    hide() {
        throw new Error("Calling method hide() of abstract class IGeoObject!");
    }
}

//var DISABLE_TRACE = false;

function printTrace(text) {
    //if (DISABLE_TRACE != false)
    {
        console.log(text);
    }
}