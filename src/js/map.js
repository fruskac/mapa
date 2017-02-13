$ = jQuery;
var $mapHolder = $('#fruskac-map');
var globalCluster;
var coordinates = [];
var $_GET = {};
var $center = [45.167031,19.69677];

document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function() {
    function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
    }
    $_GET[decode(arguments[1])] = decode(arguments[2]);
});

function setMapCenter(t) {
    
    var regex_coords = /\-?[0-9]+[\.]{0,1}[0-9]*/;
    $borderN=45.42235930900181;
    $borderE=20.36224326171873;
    $borderS=44.93836277320517;
    $borderW=18.98895224609373;
    
    $la=parseFloat($_GET['la']);
    $lo=parseFloat($_GET['lo']);
    
        
    if( ($la< $borderN && $la > $borderS)&& ( $lo< $borderE && $lo > $borderW)){
        if(t=='center'){
            return [$la,$lo];
        }
        else if(t=='zoom'){   
                
            $mapHolder.gmap3({
                marker: {
                    latLng: [$la, $lo],
                    options: {
                        zIndex: 0,
                        icon: new google.maps.MarkerImage('http://fruskac.net/sites/all/themes/fruskac/css/img/icons/current-location.png', new google.maps.Size(74, 74), new google.maps.Point(0, 0),new google.maps.Point(38, 54)),
                    }
                }
            });
            
            return 13;
        }
                
    }else{
        if(t=='center'){
            return $center;
        }else if(t=='zoom'){
            return 12
        }
    }
    
}

function setZoom() {
    //provera da li je koridinata u opsegu
    if ( Boolean($_GET['la'])==true && Boolean($_GET['lo'])==true){
        $zoom=13
    }else{
        $zoom=12
    }
    
    return $zoom;
}

function zoomUnClustering(m) {
    if(m.zoom>=13){
        $mapHolder.gmap3({get:'clusterer'}).disable();
        $('#clustering').addClass('fake');
    }else if (m.zoom<13){
        if($('#clustering').hasClass('fake') && $('#clustering').is(':checked')){
            $mapHolder.gmap3({get:'clusterer'}).enable();
        }
        $('#clustering').removeClass('fake');
    
    }
}

$.getJSON("layers/locations.json", function(json) {
    $.each(json, function(index, val) {
        val.options.icon = new google.maps.MarkerImage(val.options.icon_data.url, new google.maps.Size(val.options.icon_data.width, val.options.icon_data.height), new google.maps.Point(val.options.icon_data.x, val.options.icon_data.y));
        coordinates.push(val);
    });

    $('#locations-btns input[type=checkbox]').change(onChangeChk);
    $('.clustering-btn').change(onChangeClustering);
    $('.locations-all-btn').change(onAllLocations); 

    // create gmap3 and call the marker generation function  
    $mapHolder.gmap3({
        map: {
            options: {
                center:setMapCenter('center'),
                zoom: setMapCenter('zoom'),
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                mapTypeControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.LEFT_TOP
                },
            },
            callback: function(map) {
                google.maps.event.addListenerOnce(map, 'idle', function(){
                    //onload maps
                    zoomUnClustering(map);
                    $('#satelite-btn').show();
                });
                
                google.maps.event.addListener(map,'zoom_changed',function () {
                    zoomUnClustering(map);
                    $mapHolder.gmap3({clear:'overlay'});
                })
            }
        },
        groundoverlay: {
            options: {
                url: 'http://fruskac.net/sites/all/themes/fruskac/css/img/fruskac-logo-map.png',
                bounds: {
                    ne:{lat:45.166508, lng:19.767672},
                    sw:{lat:45.136001, lng:19.681498}
                },
                opts: {
                    opacity: 0.8,
                    clickable:false,
                }
            }
        },
        marker: {
            values: coordinates,
            cluster: {
                radius: 50, 
                // This style will be used for clusters with more than 0 markers
                0: {
                    content: '<div class="cluster small">CLUSTER_COUNT</div>',
                    width: 32,
                    height: 32
                },
                // This style will be used for clusters with more than 20 markers
                10: {
                    content: '<div class="cluster medium">CLUSTER_COUNT</div>',
                    width: 48,
                    height: 48
                },
                // This style will be used for clusters with more than 50 markers
                30: {
                    content: '<div class="cluster large">CLUSTER_COUNT</div>',
                    width: 64,
                    height: 64
                },
                events: {
                    click:function(cluster) {
                        var map = $(this).gmap3('get');
                        map.setCenter(cluster.main.getPosition());
                        map.setZoom(map.getZoom() + 1);
                    },
                     mouseover:function(){
                          $('.cluster').parent().parent().css('cursor','pointer') //hack
                     },
                }
            },
            events: {
                click: function(marker, event, context){
                    $(this).getLocationInfo(context.data.id);
                    $(this).gmap3(
                        {clear:"overlay"},
                        {overlay:{
                            latLng: marker.getPosition(),
                            options:{
                                content:  '<div class="infowindow nid'+context.data.id+' '+context.tag+'"><div class="loader">učitavanje...</div></div>',
                            }
                        }
                    });
                },
            },
            callback: function(cluster){ // get the cluster and save it in global variable
                //console.log('on init markers callback');
                globalCluster = cluster;
            }
        }
    }); //end defining gmap3
});

function onChangeClustering() {
    $mapHolder.gmap3({clear:'overlay'}); //brishe info window
    
    if ($(this).find('input').is(":checked") && !$('#clustering').hasClass('fake')){
        $mapHolder.gmap3({get:"clusterer"}).enable();
    } else {
        $mapHolder.gmap3({get:"clusterer"}).disable();
    }
}
  
function onChangeChk() {
  
    var checkedlocations = {};
    $("#locations-btns input[type=checkbox]:checked").each(function(i, chk){
        checkedlocations[$(chk).attr("name")] = true;
        $(chk).attr("name");
    });

    $mapHolder.gmap3({get:"clusterer"}).filter(function(data){
        return data.tag in checkedlocations;
    });
}

//aktiviranje i deaktiviranja lokacija 
function onAllLocations() {

    $mapHolder.gmap3({clear:"overlay"});
     
    var $locUnchecked=0;
    var $locAll=$('#locations-btns input[type=checkbox]').length;
    var $locAllEl=$(this).find('input');
    $('#locations-btns input[type=checkbox]').each(function(i, chk){
        var $locChecked=$(chk).attr('checked');
        if($locChecked=='checked'){
            
            $('#locations-btns input[type=checkbox]').attr('checked', false)
            $locAllEl.attr('checked', false)
            onChangeChk();
          
            return false
        }else{
            $locUnchecked++
            if($locUnchecked==$locAll){
                $('#locations-btns input[type=checkbox]').attr('checked', true)
                $('#locations-btns input[type=checkbox]').prop('checked', true);
                onChangeChk();
                return false
            }
        }
    
    });
}

switchClick=false;

$('#satelite-btn').on('click',function() {
    var map = $mapHolder.gmap3('get');
    if(switchClick==false){
        switchClick=true;
        map.setMapTypeId(google.maps.MapTypeId.HYBRID);
        $(this).css('top','+=30px');
    }else{
        switchClick=false;
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
        $(this).css('top','-=30px');
    }
    
    var switchName =$(this).attr('data-switch');

    $(this).attr('data-switch',$(this).text());
    $(this).text(switchName);
});


//menu
//incijalizacija control menija
$ctrlMargin=-($('#ctrl-wrap').width()/2);
$('#ctrl-wrap').css({marginLeft:$ctrlMargin});
$('#ctrl-wrap').animate({opacity:1},400,'linear');


$('.checkbox-wrap, #print-ctrl li').on('mouseenter',function() {
    if($(this).hasClass('print-map')==true){
        $labelText=$(this).find('a').text();
    }else{
        $labelText=$(this).find('label').text();
    }
    $('#location-label').show();
    $('#location-label').text($labelText);

}).on('mouseleave',function() {
    $('#location-label').hide();
});    

$('#print-ctrl h2').on('click',function() {
    if($(this).hasClass('active')==false){
        $wrapW=$(this).parent().find('.animation-wrap ul').width();
        
        $(this).addClass('active');
        $(this).parent().find('.animation-wrap').animate({width:$wrapW},300,'linear');
        $('#ctrl-wrap').animate({marginLeft:'+=-80px'},300,'linear');

    }else{
        
        $(this).removeClass('active');
        $(this).parent().find('.animation-wrap').animate({width:'0px'},300,'linear');
        $('#ctrl-wrap').animate({marginLeft:'+=80px'},300,'linear');

    }

});

function loadLayers() {
    var layers = [];

    layers.push({name: 'layer-garbage', url: 'layers/garbage.json'});
    layers.push({name: 'layer-marathon', url: 'layers/marathon.json'});

    $.each(layers, function(index, layer) {
        var markers = [];

        $.getJSON(layer.url, function(json) {
            $.each(json, function(index, val) {
                //val.options.icon = new google.maps.MarkerImage(val.options.icon_data.url, new google.maps.Size(val.options.icon_data.width, val.options.icon_data.height), new google.maps.Point(val.options.icon_data.x, val.options.icon_data.y));
                val.options.visible = $('.layer-btn[name="'+layer.name+'"]').prop('checked');
                markers.push(val);
            });

            $mapHolder.gmap3({
                marker: {
                    values: markers,
                    /*cluster: globalCluster,
                    callback: function(cluster) {
                        console.log(cluster);
                        setTimeout(function() {
                            console.log('async markers callback');
                            globalCluster.filter(function(data){
                                //console.log(data);
                                return data.options.visible === true;
                            });
                        }, 10);
                    }*/
                }
            });
        });
    });
}

$(window).on('load', function() {
    loadLayers();
});

$(document).on('change', '.layer-btn', function(e) {
    e.preventDefault();

    var $this = $(this);

    var markers = $("#fruskac-map").gmap3({
        get: {
            name: "marker",
            tag: $this.val(),
            all: true
        }
    });

    $.each(markers, function(index, val) {
        val.setVisible($this.prop('checked'));
    });

    /*$mapHolder.gmap3({
        clear: {
            tag: [$this.val()]
        }
    });*/ 
});

$(document).on('draw:map', function() {
    $.ajax({
        type: 'GET',
        url: 'layers/fruska-gora-bukovacki-maraton.gpx',
        dataType: 'xml',
    })
    .done(function(xml) {
        var points = [];
        var bounds = new google.maps.LatLngBounds ();
        // Better to construct options first and then pass it as a parameter

        $(xml).find('trkpt').each(function(i,v) {
            var lat = Number($(this).attr('lat'));
            var lon = Number($(this).attr('lon'));
            var p = new google.maps.LatLng(lat, lon);
            points.push(p);
            bounds.extend(p);
        });

        var poly = new google.maps.Polyline({
            // use your own style here
            path: points,
            strokeColor: '#FF00AA',
            strokeOpacity: .7,
            strokeWeight: 4
        });
        
        var marker = new google.maps.Marker({
            position: {lat:45.092605,lng:19.604821},
            title: 'Hello World!'
        });
       
        var map = new google.maps.Map(document.getElementById('fruskac-map'), {
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });

        poly.setMap(map);
        marker.setMap(map);

        // fit bounds to track
        map.fitBounds(bounds);
    });
});
