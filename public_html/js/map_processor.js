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

class GMenu extends  google.maps.OverlayView
{
    constructor() 
    {
        super();
        this.div_ = document.createElement('div');
        this.div_.className = 'map-menu';
        this.div_.innerHTML = '';
    }
    
    onAdd () 
    {
        var menu = this;
        var map = this.getMap();
        this.getPanes().floatPane.appendChild(this.div_);
    }

    onRemove() 
    {
        google.maps.event.removeListener(this.divListener_);
        this.div_.parentNode.removeChild(this.div_);
        this.set('position');
    }

    draw() {
        var position = this.get('position');
        var projection = this.getProjection();

        if (!position || !projection) {
          return;
        }

        var point = projection.fromLatLngToDivPixel(position);
        this.div_.style.top = point.y + 'px';
        this.div_.style.left = point.x + 'px';
    }

    close() 
    {
        this.setMap(null);
    }

    open (map, position) 
    {
        this.set('position', position);
        this.setMap(map);
        this.draw();
    }

    add(text, proc) 
    {
        var div = document.createElement('div');
        div.className = 'map-menu-element';
        div.innerHTML = text;
        google.maps.event.addDomListener(div, 'click', proc);
        this.div_.appendChild(div);
    }
}

class GGeoObject extends IGeoObject 
{
    constructor(map, object) {
        printTrace('GGeoObject::GGeoObject()');
        super(map, object);
        this.e = [];
        this.show();
        this.mnu = new GMenu();
    }
    
    enableEditting() {
        printTrace('GGeoObject::enableEditting()');
    }

    disableEditting() {
        printTrace('GGeoObject::disableEditting()');
        this.disableEvents();
        super.instance.setEditable(false);
        super.instance.setDraggable(false);
    }
    
    disableEvents() {
        printTrace('GGeoObject::disableEvents()');
        // отключаем обработчики событий
        for (var i = 0; i < this.e.length; i++)
        {
            google.maps.event.removeListener(this.e[i]);
        }
    }
    
    show() {
        printTrace('GGeoObject::show()');
        // включаем обработчики событий
        for (var i = 0; i < this.e.length; i++)
        {
            google.maps.event.addListener(this.e[i]);
        }
        super.instance.setMap(super.map);
    }
    
    hide() {
        printTrace('GGeoObject::hide()');
        this.disableEvents();
        super.instance.setMap(null);
    }
    
    addMapEvent(event, proc) {
        printTrace('GGeoObject::addMapEvent() ' + event);
        this.e.push(google.maps.event.addListener(super.map, event, proc));
    }
    
    addElementEvent(event, proc) {
        printTrace('GGeoObject::addElementEvent() ' + event);
        this.e.push(google.maps.event.addListener(super.instance, event, proc));
    }
}




class GMap extends IMap {
    constructor(div) {
        super(div);
        this.counter = 0;
        this.setObject(null);

        var instance = this;


        this.mnu = new GMenu();

        var menu = this.mnu;
        this.mnu.add('Закончить рисование', function() {
            instance.stopEditting();
            menu.close();
        });
        this.mnu.add('Удалить объект', function() {
            if (instance.getObject() !== null) 
            {
                instance.getObject().hide();
            }
            menu.close();
        });
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
            disableDoubleClickZoom: true, 
            zoomControl: false,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
        });
        this.gcoder = new GoogleGeoCoder();
        var instance = this;
        var map = this.m;
        google.maps.event.addListener(this.m, 'rightclick', function(e) {
            printTrace('google.maps.event.addListener()::rightclick ' + e.pixel);
            instance.mnu.close();
            instance.mnu.open(map, e.latLng);
        });
    }
    
    startEditting() {
        this.m.setOptions({ draggableCursor: 'crosshair' });
    }
    // Отключаем редактирование
    stopEditting() {
        if (this.getObject() !== null)
        {
            this.getObject().disableEditting();
        }
        this.m.setOptions({ draggableCursor: 'default' });
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
        var polyline = new GGeoObject(map, new google.maps.Polyline(
            {
                path: [],
                geodesic: true,
                strokeColor: this.brush.colorHex,
                strokeOpacity: 1.0,
                strokeWeight: 3,
                draggable: true, 
                editable: true
            }));
        this.setObject(polyline);
        this.startEditting();
        
        polyline.addMapEvent('click', function(e) {
            //console.log(polyline);
            printTrace('Click at ' + e.latLng.lat() + ' ' + e.latLng.lng());
            polyline.instance.getPath().push(e.latLng);
        });

        polyline.addElementEvent('rightclick', function(e) {
            //console.log(e);
            if (e.vertex !== undefined)
            {
                console.log("Remove vertex " + e.vertex);
                polyline.instance.setPath(polyline.instance.getPath().removeAt(e.vertex));
            }
        });

        var listenerStopDraw = google.maps.event.addListener(polyline, 'dblclick', function(e) {
            var state = polyline.editable;
            polyline.setEditable(!state);
            polyline.setDraggable(!state);
            if (polyline.editable)
            {
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

var selectedTool = null;


ymaps.ready(function() {
    var yamap = new GMap('divMap');
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



