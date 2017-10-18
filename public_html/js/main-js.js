var selectedTool = null;

ymaps.ready(function() {
    var _map = new GMap('divMap');
    _map.initialize();

    $('#txtCoordinates').focusout(function() 
        {
            if ($('#txtCoordinates').val() != '')
            {
                _map.geocode($('#txtCoordinates').val());
                $('#spanAddress').html($('#txtCoordinates').val());
            }
        }).keydown(function(e) 
        {
            if (e.keyCode == 13 && $('#txtCoordinates').val() != '')
            {
                _map.geocode($('#txtCoordinates').val());
                $('#spanAddress').html($('#txtCoordinates').val());
            }
        });
    
    $('#toolPolygon').click(function() 
        { 
            $('#toolPolygon').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolPolyline').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolText').removeClass("btn-primary").addClass( "btn-default" );
            $('#divMarkerText').hide();
            console.log("tool polygon selected!");
            selectedTool = 'polygon'; 
            _map.placePolygon(); 
        });
    $('#toolPolyline').click(function() 
        { 
            $('#toolPolyline').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolText').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolPolygon').removeClass("btn-primary").addClass( "btn-default" );
            $('#divMarkerText').hide();
            console.log("tool polyline selected!");
            selectedTool = 'polyline'; 
            _map.placePolyline(); 
        });
    $('#toolText').click(function() 
        { 
            $('#toolText').removeClass("btn-default").addClass( "btn-primary" );
            $('#toolPolyline').removeClass("btn-primary").addClass( "btn-default" );
            $('#toolPolygon').removeClass("btn-primary").addClass( "btn-default" );
            $('#divMarkerText').show();
            console.log("tool text selected!");
            selectedTool = 'text'; 
            _map.placeText(); 
        });
   $("#border-color").spectrum({
        color: "#880000",
        showAlpha: true,
        change: function(color) {
            _map.brush.color = color.toHex8String();
        }
    });
   $("#fill-color").spectrum({
        color: "#88bb0000",
        showAlpha: true,
        change: function(color) {
            _map.brush.fillcolor = color.toHex8String();
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
        if (_map !== null)
        {
            _map.destroy();
            center = _map.centerArray;
        }
        if ($(this).val() == 'yandex') 
        {
            _map = new YaMap2('divMap');
        }
        else if ($(this).val() == 'google') 
        {
            _map = new GMap('divMap');
        }
        _map.initialize();
        if (center !== null)
        {
            _map.centerArray = center;
        }
    });
    $('#radScale2000').click(function() {
        _map.scale2000();
        $('#spanScale').html('Масштаб 1:2000');
    });
        
    $('#radScale5000').click(function() {
        _map.scale5000();
        $('#spanScale').html('Масштаб 1:5000');
    });
        
    $('#radScale10000').click(function() {
        _map.scale10000();
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
        window.open("pdf.php?address=" + $("#spanAddress").html() + "&center=" + _map.centerArray + "&zoom=" +_map.zoom + "&scale=" + $("input[name=radScale]:checked").val());
    });
    
    $('#btnSearch').click(function() {
        if ($('#txtCoordinates').val() != '')
        {
            _map.geocode($('#txtCoordinates').val());
            $('#spanAddress').html($('#txtCoordinates').val());
        }
    });
    $('#btnApplyMarkerText').click(function(){
        _map.getObject().setInfo($('#txtMarkerText').val());
    });
    
});



