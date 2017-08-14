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
    constructor() {

    }
    
    create() {
        throw new Error("Calling method create() of abstract class IGeoObject!");
    }
    
    enableEditting() {
        throw new Error("Calling method enableEditting() of abstract class IGeoObject!");
    }

    disableEditting() {
        throw new Error("Calling method disableEditting() of abstract class IGeoObject!");
    }
}

class YaGeoCoder extends IGeoCoder {
    constructor() {
        super();
    }
    
    find(map, address) {
        ymaps.geocode(address, {
                results: 1
            }).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0),
                    coords = firstGeoObject.geometry.getCoordinates(),
                    bounds = firstGeoObject.properties.get('boundedBy');
                map.center = coords;
                map.setBounds(bounds, {
                   checkZoomRange: true
                });
           });    
    }
}
class GoogleGeoCoder extends IGeoCoder {
    constructor() {
        super();
        this.gcoder = new google.maps.Geocoder;
    }
    
    find(map, address) {
        this.gcoder.geocode( { 'address': address }, function(results, status) {
            if (status == 'OK') {
                map.center = results[0].geometry.location;
            } else {
                  alert('Не удалось найти данный адрес!');
            }
        });
    }
}

function clearDrawingTool() {
    console.log('clearDrawingTool()');
    $('#toolPolyline').removeClass("btn-primary").addClass( "btn-default" );
    $('#toolText').removeClass("btn-primary").addClass( "btn-default" );
    $('#toolPolygon').removeClass("btn-primary").addClass( "btn-default" );
}

function GoogleMenu(map) {
    this.m = map;        
    this.div_ = document.createElement('div');
    this.div_.className = 'delete-menu';
    this.div_.innerHTML = 'Delete';
}

GoogleMenu.prototype = new google.maps.OverlayView();
GoogleMenu.prototype.onAdd = function() {
    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    div.innerHTML = 'fdffgffg';

    this.div_ = div;
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};
GoogleMenu.prototype.draw = function() {
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};
GoogleMenu.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};
this.setMap(this.m);

function open() {
    console.log('GoogleMenu::open()');
    this.setMap(this.m);
    this.draw();
}

function close() {
    console.log('GoogleMenu::close()');
    this.setMap(null);
}


class YaMap extends IMap {
    constructor(div) {
        super(div);
        super.setObject(null);
    }
    
    initialize() {
        var scale = $("input[name=radScale]:checked").val();
        switch (scale)
        {
            case '2000':
                scale = 18;
                break;
            case '5000':
                scale = 17;
                break;
            case '10000':
                scale = 16;
                break;
            default:
                scale = 18;
                break;
        }
        this.m = new ymaps.Map(super.div, 
        {
            center: [55.76, 37.64], 
            zoom: scale,
            controls: [
                "geolocationControl",
                "typeSelector"
            ],
            behaviors: [
                "drag",
                "multiTouch",
                "rightMouseButtonMagnifier"
            ]
        });
        this.m.controls.remove('')
        console.log(this.m.behaviors);
        this.yacoder = new YaGeoCoder();
        this.counter = 0;
        var instance = this;
        this.m.events.add('dblclick', function () {
            if (instance.getObject() !== null )
            {
                instance.getObject().options.set('draggable', false);
                instance.getObject().editor.stopEditing();
                instance.getObject().editor.stopDrawing();
                clearDrawingTool();
            }
        });
    }
    
    destroy() {
        this.m.destroy();
    }
    
    
    get center() {
        return this.m.getCenter();
    }
    
    set center(coords) {
        this.m.setCenter(coords);
        
    }
   
    get centerArray() {
        return this.m.getCenter();
    }
 
    set centerArray(coords) {
        this.m.setCenter(coords);
        
    }
    
    
    geocode(address) {
        console.log(address);
        this.yacoder.find(this, address);
    }

    placeText() {
        var map = this.m;
        this.counter++;
        
        
        var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div class="balloon-texteditor">' +
                '<input type="text" value="" />' +
            '</div>',
        {

            build: function () {
                BalloonContentLayout.superclass.build.call(this);
            },

            clear: function () {
                BalloonContentLayout.superclass.clear.call(this);
            },
        });

        var placemark = new ymaps.Placemark([], {
            iconContent: ''
        } , {
            balloonContentLayout: BalloonContentLayout,
            balloonPanelMaxMapArea: 0,
            draggable: "true",
            preset: "islands#redStretchyIcon",
            iconColor: this.brush.colorHex,
            openEmptyBalloon: true
        });
        this.setObject(placemark);
        
        map.geoObjects.add(placemark);
        
        placemark.editor.startDrawing();
        placemark.balloon.open();
            
        var globalmap = this;
        
        placemark.events.add('balloonopen', 
            function(e) {
                globalmap.setObject(placemark);
            });
            
        $(document).on('keydown', '.balloon-texteditor input', function(e)
        {
            if (e.keyCode == 13)
            {
                if ($(this).val() != '')
                {
                    globalmap.getObject().properties.set('iconContent', $(this).val());
                    globalmap.getObject().balloon.close();
                    clearDrawingTool();
                }
                else
                {
                    globalmap.getObject().balloon.close();
                    map.geoObjects.remove(globalmap.getObject());
                    globalmap.setObject(null);
                }
            }
        });
    }
    placePolyline() {
        var map = this.m;
        var polyline = new ymaps.Polyline([
        ], {}, {
            // Задаем опции геообъекта.
            // Цвет с прозрачностью.
            strokeColor: this.brush.color,
            // Ширину линии.
            strokeWidth: 4,
            // Максимально допустимое количество вершин в ломаной.
            editorMaxPoints: 60,
            editorMinPoints:2,
            draggable: true,
            // Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
            editorMenuManager: function (items) {
                items.push({
                    title: "Удалить линию",
                    onClick: function () {
                        map.geoObjects.remove(polyline);
                    }
                });
                items.push({
                    title: "Завершить редактирование",
                    onClick: function () {
                        polyline.options.set('draggable', false);
                        polyline.editor.stopEditing();
                        clearDrawingTool();
               }
                });
                return items;
            }
        });
        polyline.events.add('dblclick', function () {
            console.log('dffdf ' + polyline.editor.state.get('drawing') + ' ' + polyline.editor.state.get('editing'));
            if (!polyline.editor.state.get('drawing')&&!polyline.editor.state.get('editing'))
            {
                polyline.options.set('draggable', true);
                polyline.editor.startEditing();
            }
            else
            {
                polyline.options.set('draggable', false);
                polyline.editor.stopEditing();
                polyline.editor.stopDrawing();
                clearDrawingTool();
            }
        });
        this.setObject(polyline);
        this.m.geoObjects.add(polyline);
        polyline.editor.startDrawing();
    }
    placePolygon() {
        var map = this.m;
        var polygon = new ymaps.Polygon([[]], {
        }, {
            fillColor: this.brush.fillcolor,
            strokeColor: this.brush.color,
            strokeWidth: 4,
            draggable: true,
            // Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
            editorMenuManager: function (items) {
                items.push({
                    title: "Удалить полигон",
                    onClick: function () {
                        map.geoObjects.remove(polygon);
                    }
                });
                items.push({
                    title: "Завершить редактирование",
                    onClick: function () {
                        polygon.editor.stopEditing();
                        polygon.options.set('draggable', false);
                        clearDrawingTool();
                   }
                });
                return items;
            }
        });

        polygon.events.add('dblclick', function () {
            if (!polygon.editor.state.get('drawing'))
            {
                polygon.options.set('draggable', true);
                polygon.editor.startEditing();
            }
        });

        this.setObject(polygon);
        this.m.geoObjects.add(polygon);
        polygon.editor.startDrawing();
    }
    
    scale2000() {
        this.m.setZoom(18);
    }
    
    scale5000() {
        this.m.setZoom(17);
    }
    
    scale10000() {
        this.m.setZoom(16);
    }

    get zoom() {
        return this.m.getZoom();
    }
}
class YaMap2 extends IMap {
    constructor(div) {
        super(div);
        super.setObject(null);
    }
    
    initialize() {
        var scale = $("input[name=radScale]:checked").val();
        switch (scale)
        {
            case '2000':
                scale = 18;
                break;
            case '5000':
                scale = 17;
                break;
            case '10000':
                scale = 16;
                break;
            default:
                scale = 18;
                break;
        }
        this.m = new ymaps.Map(super.div, 
        {
            center: [55.76, 37.64], 
            zoom: scale,
            controls: [
                "geolocationControl",
                "typeSelector"
            ],
            behaviors: [
                "drag",
                "multiTouch",
                "rightMouseButtonMagnifier"
            ]
        });
        this.m.controls.remove('')
        console.log(this.m.behaviors);
        this.yacoder = new YaGeoCoder();
        this.counter = 0;
        var instance = this;
    }
    
    destroy() {
        this.m.destroy();
    }
    
    
    get center() {
        return this.m.getCenter();
    }
    
    set center(coords) {
        this.m.setCenter(coords);
        
    }
   
    get centerArray() {
        return this.m.getCenter();
    }
 
    set centerArray(coords) {
        this.m.setCenter(coords);
        
    }
    
    
    geocode(address) {
        console.log(address);
        this.yacoder.find(this, address);
    }

    placeText() {
        var map = this.m;
        var instance = this;
        
        var handler = this.m.events.group().add('click', function(e) {
            console.log('Map click!');
            var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
                '<div class="balloon-texteditor">' +
                    '<input type="text" value="" />' +
                '</div>',
            {

                build: function () {
                    BalloonContentLayout.superclass.build.call(this);
                },

                clear: function () {
                    BalloonContentLayout.superclass.clear.call(this);
                },
            });
            
            var placemark = new ymaps.Placemark(e.get('coords'), {
                iconContent: ''
            } , {
                balloonContentLayout: BalloonContentLayout,
                balloonPanelMaxMapArea: 0,
                draggable: "true",
                preset: "islands#redStretchyIcon",
                iconColor: instance.brush.colorHex,
                openEmptyBalloon: false
            });
            instance.setObject(placemark);

            map.geoObjects.add(placemark);
            placemark.balloon.open();
              placemark.events.add('balloonopen', 
                function(e) {
                    console.log('onBalloonOpen');
                    //map.geoObjects.remove(globalmap.getObject());
                });
          placemark.events.add('balloonclose', 
                function(e) {
                    console.log('onBalloonClose::val() ' + $('.balloon-texteditor input').val());
                    
                    if ($('.balloon-texteditor input').val() === '')
                    {
                        map.geoObjects.remove(globalmap.getObject());
                    }
                });

            $(document).on('keydown', '.balloon-texteditor input', function(e)
            {
                if (e.keyCode == 13)
                {
                    if ($(this).val() != '')
                    {
                        instance.getObject().properties.set('iconContent', $(this).val());
                        instance.getObject().balloon.close();
                        clearDrawingTool();
                    }
                    else
                    {
                        instance.getObject().balloon.close();
                        map.geoObjects.remove(instance.getObject());
                        instance.setObject(null);
                    }
                }
            });
            
            handler.removeAll();
            clearDrawingTool();
        });

    }
    placePolyline() {
        var map = this.m;
        var polyline = new ymaps.Polyline([
        ], {}, {
            // Задаем опции геообъекта.
            // Цвет с прозрачностью.
            strokeColor: this.brush.color,
            // Ширину линии.
            strokeWidth: 4,
            // Максимально допустимое количество вершин в ломаной.
            editorMaxPoints: 60,
            editorMinPoints:2,
            draggable: true,
            // Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
            editorMenuManager: function (items) {
                items.push({
                    title: "Удалить линию",
                    onClick: function () {
                        map.geoObjects.remove(polyline);
                    }
                });
                items.push({
                    title: "Завершить редактирование",
                    onClick: function () {
                        polyline.options.set('draggable', false);
                        polyline.editor.stopEditing();
                        clearDrawingTool();
               }
                });
                return items;
            }
        });
        polyline.events.add('dblclick', function () {
            console.log('dffdf ' + polyline.editor.state.get('drawing') + ' ' + polyline.editor.state.get('editing'));
            if (!polyline.editor.state.get('drawing')&&!polyline.editor.state.get('editing'))
            {
                polyline.options.set('draggable', true);
                polyline.editor.startEditing();
            }
            else
            {
                polyline.options.set('draggable', false);
                polyline.editor.stopEditing();
                polyline.editor.stopDrawing();
                clearDrawingTool();
            }
        });
        this.setObject(polyline);
        this.m.geoObjects.add(polyline);
        polyline.editor.startDrawing();
    }
    placePolygon() {
        var map = this.m;
        var polygon = new ymaps.Polygon([[]], {
        }, {
            fillColor: this.brush.fillcolor,
            strokeColor: this.brush.color,
            strokeWidth: 4,
            draggable: true,
            // Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
            editorMenuManager: function (items) {
                items.push({
                    title: "Удалить полигон",
                    onClick: function () {
                        map.geoObjects.remove(polygon);
                    }
                });
                items.push({
                    title: "Завершить редактирование",
                    onClick: function () {
                        polygon.editor.stopEditing();
                        polygon.options.set('draggable', false);
                        clearDrawingTool();
                   }
                });
                return items;
            }
        });

        polygon.events.add('dblclick', function () {
            if (!polygon.editor.state.get('drawing'))
            {
                polygon.options.set('draggable', true);
                polygon.editor.startEditing();
            }
        });

        this.setObject(polygon);
        this.m.geoObjects.add(polygon);
        polygon.editor.startDrawing();
    }
    
    scale2000() {
        this.m.setZoom(18);
    }
    
    scale5000() {
        this.m.setZoom(17);
    }
    
    scale10000() {
        this.m.setZoom(16);
    }

    get zoom() {
        return this.m.getZoom();
    }
}

class GMap extends IMap {
    constructor(div) {
        super(div);
        this.counter = 0;
        this.setObject(null);
        this.vertexMenu = new GoogleMenu();

    }
    

    initialize() {
        var scale = $("input[name=radScale]:checked").val();
        switch (scale)
        {
            case '2000':
                scale = 18;
                break;
            case '5000':
                scale = 17;
                break;
            case '10000':
                scale = 16;
                break;
            default:
                scale = 18;
                break;
        }
        this.m = new google.maps.Map(document.getElementById(super.div), 
        {
            center: {lat: 55.76, lng: 37.64}, 
            zoom: scale,
            disableDefaultUI: true,
            draggableCursor:'default',
            scrollwheel: false,
            disableDoubleClickZoom: true, // <---
            zoomControl: false,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
        });
        this.gcoder = new GoogleGeoCoder();
        var instance = this;
        google.maps.event.addListener(this.m, 'rightclick', function(e) {
            instance.vertexMenu.open();
        });
    }

    destroy() {
        $(super.div).hide();
    }

    get center() {
        return this.m.getCenter();
    }
    
    set center(coords) {
        return this.m.setCenter(coords);
    }

    get centerArray() {
        return [this.m.getCenter().lat(), this.m.getCenter().lng()];
    }
    
    set centerArray(value) {
        this.m.setCenter(new google.maps.LatLng({lat: value[0], lng: value[1]}));
    }
    
    geocode(address) {
        this.gcoder.find(this, address);
    }
    
    placeText() {
        var map = this.m;
        var globalmap = this;
        var listener = google.maps.event.addListener(this.m, 'click', function(e) {
            var marker = new google.maps.Marker({
                position: e.latLng,
                map: map,
                draggable: true,
                editable: true
            });
            var infowindow = new google.maps.InfoWindow({
                content: 
                    '<div id="infownd'+(this.counter++) + '" class="balloon-texteditor">' +
                        '<input type="text" value="" />' + 
                        '<span></span>' +
                    '</div>',

            });
            globalmap.setObject(infowindow);
            $(document).on('keydown', '.balloon-texteditor input', function(e)
                {
                    if (e.keyCode == 13)
                    {
                        if ($(this).val() != '')
                        {
                            console.log('dfdf');
                            globalmap.getObject().setContent($(this).val());
                        }
                    }
                });
            infowindow.open(map, marker);
            google.maps.event.addListener(infowindow, 'closeclick', function() {
                marker.setMap(null);
            });
            google.maps.event.removeListener(listener);
            clearDrawingTool();
        });
    }
    
    placePolyline() {
        var map = this.m;
        var instance = this;
        var polyline = new google.maps.Polyline(
            {
                path: [],
                geodesic: true,
                strokeColor: this.brush.colorHex,
                strokeOpacity: 1.0,
                strokeWeight: 3,
                draggable: true, 
                editable: true
            });
        
        polyline.setMap(this.m);
        this.setObject(polyline)
        
        var listenerDraw = google.maps.event.addListener(this.m, 'click', function(e) {
            polyline.getPath().push(e.latLng);
        });

        var removeEvent = google.maps.event.addListener(polyline, 'rightclick', function(e) {
            if (e.vertext == undefined)
            {
                return;
            }

        });

        var listenerStopDraw = google.maps.event.addListener(polyline, 'dblclick', function(e) {
            var state = polyline.editable;
            polyline.setEditable(!state);
            polyline.setDraggable(!state);
            if (polyline.editable)
            {
                //google.maps.event.removeListener(listenerStopDraw);
                google.maps.event.removeListener(listenerDraw);
                clearDrawingTool();
            }
            else
            {
                google.maps.event.addListener(listenerDraw);
            }
        });

    }
    
    placePolygon() {
        var map = this.m;
        var instance = this;
        var polygon = new google.maps.Polygon({
                paths: [[],[]],
                strokeColor: this.brush.colorHex,
                strokeOpacity: this.brush.colorA / 255,
                strokeWeight: 3,
                fillColor: this.brush.fillcolorHex,
                fillOpacity: this.brush.fillcolorA / 255,
                editable: true,
                draggable: true
            });
            
        polygon.setMap(map);
        this.setObject(polygon)
        
        var listenerDraw = google.maps.event.addListener(this.m, 'click', function(e) {
            if (polygon.getPaths()[0] === 'undefined')
            {
                polygon.getPaths().getAt(0).push(new Array());
            }
            else
            {
                polygon.getPaths().getAt(0).push(e.latLng);
            }
            console.log(polygon.getPaths());
        });

        var removeEvent = google.maps.event.addListener(polygon, 'rightclick', function() {
           if (instance.getObject() !== null)
           {
               instance.getObject().setMap(null);
           }
        });

        var listenerStopDraw = google.maps.event.addListener(polygon, 'dblclick', function(e) {
            polygon.setEditable(false);
            polygon.setDraggable(false);
            google.maps.event.removeListener(listenerDraw);
            google.maps.event.removeListener(listenerStopDraw);
            clearDrawingTool();
        });
    }   
    
    scale2000() {
        this.m.setZoom(18);
    }
    
    scale5000() {
        this.m.setZoom(17);
    }
    
    scale10000() {
        this.m.setZoom(16);
    }
    
    get zoom() {
        return this.m.getZoom();
    }
}

var yamap = new YaMap2('divMap');
var selectedTool = null;


ymaps.ready(function() {
    yamap.initialize();

    $('#txtCoordinates').focusout(function() 
        {
            if ($('#txtCoordinates').val() != '')
            {
                yamap.geocode($('#txtCoordinates').val());
                $('#spanAddress').html($('#txtCoordinates').val());
            }
        }).keydown(function(e) 
        {
            if (e.keyCode == 13 && $('#txtCoordinates').val() != '')
            {
                yamap.geocode($('#txtCoordinates').val());
                $('#spanAddress').html($('#txtCoordinates').val());
            }
        });
    
    $('#toolPolygon').click(function() 
        { 
            $('#toolPolygon').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolPolyline').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolText').removeClass("btn-primary").addClass( "btn-default" );
            console.log("tool polygon selected!");
            selectedTool = 'polygon'; 
            yamap.placePolygon(); 
        });
    $('#toolPolyline').click(function() 
        { 
            $('#toolPolyline').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolText').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolPolygon').removeClass("btn-primary").addClass( "btn-default" );
            console.log("tool polyline selected!");
            selectedTool = 'polyline'; 
            yamap.placePolyline(); 
        });
    $('#toolText').click(function() 
        { 
            $('#toolText').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolPolyline').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolPolygon').removeClass("btn-primary").addClass( "btn-default" );
            console.log("tool text selected!");
            selectedTool = 'text'; 
            yamap.placeText(); 
        });
   $("#border-color").spectrum({
        color: "#880000",
        showAlpha: true,
        change: function(color) {
            yamap.brush.color = color.toHex8String();
        }
    });
   $("#fill-color").spectrum({
        color: "#88bb0000",
        showAlpha: true,
        change: function(color) {
            yamap.brush.fillcolor = color.toHex8String();
        }
  
    });
    $('.btn-group').on('input', 'change', function(){
        var checkbox = $(this);
        var label = checkbox.parent('label');
        if (checkbox.is(':checked'))  {
           label.addClass('active');
        }
        else {
           label.removeClass('active');
        }
    });
    $("input[name=radMaps]:radio").change(function () {
        var center = null;
        if (yamap !== null)
        {
            yamap.destroy();
            center = yamap.centerArray;
        }
        if ($(this).val() == 'yandex') 
        {
            yamap = new YaMap2('divMap');
        }
        else if ($(this).val() == 'google') 
        {
            yamap = new GMap('divMap');
        }
        yamap.initialize();
        if (center !== null)
        {
            yamap.centerArray = center;
        }
    });
    $('#radScale2000').click(function() {
        yamap.scale2000();
        $('#spanScale').html('Масштаб 1:2000');
    });
        
    $('#radScale5000').click(function() {
        yamap.scale5000();
        $('#spanScale').html('Масштаб 1:5000');
    });
        
    $('#radScale10000').click(function() {
        yamap.scale10000();
        $('#spanScale').html('Масштаб 1:10000');
    });
    
    $('#spanAddress').click(function() {
        $('#txtAddress').val($('#spanAddress').html());
        $('#spanAddress').hide();
        $('#txtAddress').show();
        $('#txtAddress').select();
    });
    $('#txtAddress').keydown(function(e) {
        if (e.keyCode == 13) 
        {
            $('#spanAddress').html($('#txtAddress').val());
            $('#txtAddress').hide();
            $('#spanAddress').show();
        }
    }).focusout(function() {
        $('#spanAddress').html($('#txtAddress').val());
        $('#txtAddress').hide();
        $('#spanAddress').show();
    });
    
    $('#addressHelper').mouseover(function(){
        if ($('#spanAddress').is(":visible"))
        {
            $('#spanAddress').fadeOut().fadeIn();
        }
    });
    
    $('#btnSave').click(function() {
        window.open("pdf.php?address=" + $("#spanAddress").html() + "&center=" + yamap.centerArray + "&zoom=" +yamap.zoom + "&scale=" + $("input[name=radScale]:checked").val());
    });
    
    $('#btnSearch').click(function() {
        if ($('#txtCoordinates').val() != '')
        {
            yamap.geocode($('#txtCoordinates').val());
            $('#spanAddress').html($('#txtCoordinates').val());
        }
    });
    
    
});



