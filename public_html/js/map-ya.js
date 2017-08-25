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
