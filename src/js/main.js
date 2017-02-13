(function( root, $, undefined ) {
    'use strict';

    var map;
    var mapCluster;
    var infoWindow;
    var layers = [];
    var objects = [];
    var clustering_enabled;
    var lat = Number(getUrlParameter('lat'));
    var lng = Number(getUrlParameter('lng'));
    var fit_bounds = false;

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    function setMapOption(type) {
        var borderN = 45.42235930900181;
        var borderE = 20.36224326171873;
        var borderS = 44.93836277320517;
        var borderW = 18.98895224609373;

        if (isNaN(lat) === false && isNaN(lng) === false) {

            var lat1 = parseFloat(lat);
            var lng1 = parseFloat(lng);

            if ((lat1 < borderN && lat1 > borderS) && (lng1 < borderE && lng1 > borderW)) {
                // disable map's bounding to kmls layers
                fit_bounds = true;

                if (type == 'center') {

                    return {lat: lat1, lng: lng1};

                } else if (type == 'zoom') {

                    new google.maps.Marker({
                        position: new google.maps.LatLng(lat1, lng1),
                        map: map,
                        zIndex: 0,
                        icon: new google.maps.MarkerImage(
                            'http://fruskac.net/sites/all/themes/fruskac/css/img/icons/current-location.png',
                            new google.maps.Size(74, 74),
                            new google.maps.Point(0, 0),
                            new google.maps.Point(38, 54)
                        )
                    });

                    return 13;
                }

            }

        }

        if (type == 'center') {

            return {lat: 45.167031, lng: 19.69677};

        } else if (type == 'zoom') {

            return 12;

        }
    }

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            }
        });

        map.setCenter(setMapOption('center'));
        map.setZoom(setMapOption('zoom'));

        google.maps.event.addListenerOnce(map, 'idle', function() {
            $('.satellite-view').show();
        });

        google.maps.event.addListener(map, 'center_changed', function() {
            console.log('center changed');
        });

        google.maps.event.addListener(map, 'bounds_changed', function() {
            console.log('bounds changed');
        });

        var overlayImageBounds = {
            north: 45.166508,
            south: 45.136001,
            east: 19.767672,
            west: 19.681498
        };
        var overlayOptions = {
            opacity: 0.8,
            clickable: false
        };
        var groundOverlay = new google.maps.GroundOverlay(
            'http://fruskac.net/sites/all/themes/fruskac/css/img/fruskac-logo-map.png',
            overlayImageBounds,
            overlayOptions
        );
        groundOverlay.setMap(map);

        // initialize marker clusterer without markers arr, will be populated later
        mapCluster = new MarkerClusterer(map, [], {
            gridSize: 50,
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });

        // update "clustering_enabled" global variable with current state of clustering checkbox
        clustering_enabled = $('.clustering-checkbox :checkbox').prop('checked');

        // trigger "init" event for all main layers
        $('.layer-toggle :checkbox').trigger('init');

        var get_tracks = getUrlParameter('tracks');
        var get_kmls = getUrlParameter('kmls');

        if (get_tracks) {
            getLayer(get_tracks, 'tracks');
        }

        if (get_kmls) {
            getLayer(get_kmls, 'kmls');
        }
    }

    function createTrack(data) {
        var track;

        $.ajax({
            type: 'GET',
            url: data.url,
            dataType: 'xml',
            async: false
        })
        .done(function(response) {
            var poly;
            var points = [];
            var bounds = new google.maps.LatLngBounds();
            // Better to construct options first and then pass it as a parameter

            $(response).find('trkpt').each(function(i, v) {
                var lat = Number($(this).attr('lat'));
                var lon = Number($(this).attr('lon'));
                var p = new google.maps.LatLng(lat, lon);
                points.push(p);
                bounds.extend(p);
            });

            var poly_options = {
                path: points,
                strokeColor: data.data.stroke_color,
                strokeOpacity: .7,
                strokeWeight: 4,
                data: {
                    type: 'track'
                }
            };

            // if track has fill color, initialize it as "Polygon" object, otherwise as "Polyline" object
            if (data.data.fill_color) {
                poly_options.fillColor = data.data.fill_color;
                poly_options.fillOpacity = 0.35;

                poly = new google.maps.Polygon(poly_options);
            } else {
                poly = new google.maps.Polyline(poly_options);
            }

            // fit bounds to track
            // map.fitBounds(bounds);

            var trackInfo = '<h2>' + data.url + '</h2>';

            poly.addListener('click', function(event) {
                if (infoWindow !== undefined) {
                    infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: trackInfo
                });

                // Replace our Info Window's position
                infoWindow.setContent(trackInfo);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map);
            });

            track = poly;
        });

        return track;
    }

    function createKML(data) {
        // initialize "KmlLayer" object
        var kml = new google.maps.KmlLayer(data.url, {
            suppressInfoWindows: true,
            preserveViewport: fit_bounds,
            data: {
                type: 'kml'
            }
        });

        var kmlInfo = '<h2>' + data.url + '</h2>';

        kml.addListener('click', function(event) {
            if (infoWindow !== undefined) {
                infoWindow.close();
            }

            infoWindow = new google.maps.InfoWindow({
                content: kmlInfo
            });

            // Replace our Info Window's position
            infoWindow.setContent(kmlInfo);
            infoWindow.setPosition(event.latLng);
            infoWindow.open(map);
        });

        return kml;
    }

    function loadMarkers(markers_data) {
        var markers_arr = [];

        $.each(markers_data, function(i, val) {
            var tag = val.tag;
            var title = val.data.title;

            // create "MarkerImage" object for current marker
            var icon = new google.maps.MarkerImage(
                val.options.icon_data.url,
                new google.maps.Size(val.options.icon_data.width, val.options.icon_data.height),
                new google.maps.Point(val.options.icon_data.x, val.options.icon_data.y)
            );

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(val.lat, val.lng),
                icon: icon,
                title: title,
                data: {
                    type: 'marker',
                    tag: tag
                }
            });

            var markerInfo = '<h2>' + title + '</h2>'+
                             '<a href="' + val.data.link + '" target="_blank"><img src="' + val.data.image + '"></a>'+
                             '<p>' + val.data.description + '</p>';

            marker.addListener('click', function() {
                if (infoWindow !== undefined) {
                    infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: markerInfo
                });

                infoWindow.open(map, marker);
            });

            // set marker's visibility state based on its tag
            // set to true if marker's tag is active layer, otherwise set it to false
            if (layers.indexOf(tag) !== -1) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }

            // push it to the map's objects array
            objects.push(marker);
            // push it to the local array to be able to add these new markers to map
            markers_arr.push(marker);
        });

        // add objects to map
        addMapObjects(markers_arr);
    }

    function loadTracks(tracks_data) {
        var tracks_arr = [];

        $.each(tracks_data, function(i, val) {
            var track = createTrack(val);

            if (track) {
                var tag = val.tag;

                track.data.tag = tag;

                // set track's visibility state based on its tag
                // set to true if track's tag is active layer, otherwise set it to false
                if (layers.indexOf(tag) !== -1) {
                    track.setVisible(true);
                } else {
                    track.setVisible(false);
                }

                // push it to the map's objects array
                objects.push(track);
                // push it to the local array to be able to add these new tracks to map
                tracks_arr.push(track);
            }
        });

        // add objects to map
        addMapObjects(tracks_arr);
    }

    function loadKMLs(kmls_data) {
        $.each(kmls_data, function(i, val) {
            var kml = createKML(val);

            var tag = val.tag;

            kml.data.tag = tag;

            // set kml layer's visibility state based on its tag
            // set to true if layer's tag is active layer
            if (layers.indexOf(tag) !== -1) {
                kml.setMap(map);
            } else {
                kml.setMap(null);
            }

            // push it to the map's objects array
            objects.push(kml);
        });
    }

    function loadLayer(name, type) {
        var url = 'layers/' + name + '.json';

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            async: false
        })
        .done(function(data) {
            switch(type) {
                case 'marker':
                    loadMarkers(data);
                    break;
                case 'track':
                    loadTracks(data);
                    break;
                case 'kml':
                    loadKMLs(data);
                    break;
                default:
                    alert('Unknown layer type');
                    break;
            }
        });
    }

    function addMapObjects(objects_arr) {
        $.each(objects_arr, function(i, object) {
            object.setMap(map);

            // add object of "marker" type to the global map cluster
            if (clustering_enabled && object.data.type == 'marker' && object.visible === true) {
                mapCluster.addMarker(object);
            }
        });
    }

    function removeMapObjects(objects_arr) {
        $.each(objects_arr, function(i, object) {
            object.setMap(null);

            // remove object of "marker" type from the global map cluster
            if (clustering_enabled && object.data.type == 'marker') {
                mapCluster.removeMarker(object);
            }
        });
    }

    function filterObjects() {
        var objects_add = [];
        var objects_remove = [];

        mapCluster.clearMarkers();

        $.each(objects, function(i, object) {
            // if tags are matching set visibility to true, otherwise to false
            if (layers.indexOf(object.data.tag) !== -1) {
                if (object.data.type != 'kml') {
                    object.setVisible(true);
                }
                objects_add.push(object);
            } else {
                if (object.data.type != 'kml') {
                    object.setVisible(false);
                }
                objects_remove.push(object);
            }
        });

        removeMapObjects(objects_remove);

        addMapObjects(objects_add);
    }

    function getLayer(name, type) {
        var url = 'data/' + name + '.json';

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            async: false
        })
        .done(function(data) {
            switch(type) {
                case 'tracks':
                    getTracks(data);
                    break;
                case 'kmls':
                    getKMLs(data);
                    break;
                default:
                    break;
            }
        });
    }

    function getTracks(tracks_data) {
        $.each(tracks_data, function(i, val) {
            var track = createTrack(val);
            if (track) {
                track.setMap(map);
                track.setVisible(true);
            }
        });
    }

    function getKMLs(kmls_data) {
        $.each(kmls_data, function(i, val) {
            var kml = createKML(val);
            if (kml) {
                kml.setMap(map);
            }
        });
    }

    // initialize google map on window load
    google.maps.event.addDomListener(window, 'load', initMap);

    function setScroll() {
        var windowHeight = $(window).height();
        var panelHeight = $('.panel').height();
        var panelHeaderHeight = $('.panel-header').height();
        var panelContentHeight = $('.simplebar-content').height();
    
        if ((windowHeight<panelHeight) && ($('.panel-layers').hasClass('simplebar') == false)) {
            $('.panel-layers').height(windowHeight - panelHeaderHeight);
            $('.panel-layers').addClass('simplebar');
            $('.panel-layers').simplebar();
        } else if((windowHeight<(panelContentHeight+panelHeaderHeight)) && $('.panel-layers').hasClass('simplebar')) {
            $('.panel-layers').height(windowHeight - panelHeaderHeight);
            $('.panel-layers').simplebar('recalculate');
        } else {
            $('.panel-layers').height(panelContentHeight);
            $('.panel-layers').simplebar('recalculate');
        }
    }

    function closeMenu() {
        var windowWidth = $(window).width();

        if (windowWidth < 900) {
            $('.panel').addClass('collapsed');
        }
    }

    closeMenu();
    setScroll();

    $(function() {
        if (BigScreen.enabled && getUrlParameter('embed') == 1) {
            $('.fullscreen-btn').show();
            $('.panel-header').hide();
        }
    });

    $(window).on('resize', function() {
        setScroll();
    });
    
    $(document).on('click', '.menu-btn', function(e) {
        $('.panel').toggleClass('collapsed');
        setScroll();
    });

    $(document).on('click', '.expand-collapse', function(e) {
        $(this).toggleClass('expanded collapsed');
        setScroll();
    });

    $(document).on('init change', '.layer-toggle :checkbox', function(e) {
        var $this = $(this);
        var $parent = $this.parent();
        var layer = $parent.data('layer');
        var type = $parent.data('type');
        var checked = $this.prop('checked');
        var $panel = $this.parents('.layer');
        var is_init = (e.type === 'init' ? true : false); // is "init" event

        if (is_init === false) {
            $panel.children('.expand-collapse').toggleClass('expanded collapsed');
            setScroll();
        }

        var $sublayers_wrapper = $panel.children('.sublayers');

        // check if this layer has sublayers
        if ($sublayers_wrapper.length > 0) {
            if (is_init === false) {
                var $sublayers = $sublayers_wrapper.find('.layer-checkbox :checkbox');

                if (checked === false) {
                    $sublayers.prop('checked', false).trigger('change', [checked]);
                } else {
                    $.each($sublayers, function() {
                        var $sublayer = $(this);

                        // only show sublayers which were shown before the main layer was switched off
                        if ($sublayer.parent().data('shown') === true) {
                            $sublayer.prop('checked', true).trigger('change', [checked]);
                        }
                    });
                }
            } else {
                $sublayers_wrapper.find('.layer-checkbox :checkbox').trigger('init', [checked]);
            }
        }

        // check if this layer is an active layer and set its visibility
        var index = layers.indexOf(layer);
        if (index !== -1 && checked === false) {
            layers.splice(index, 1);
        } else {
            if (checked === true) {
                layers.push(layer);
            }

            // if layer wasn't active and wasn't load before, load its content
            // set "loaded" flag to avoid further loading of the same layer
            if (index === -1 && checked === true && $parent.data('loaded') === undefined) {
                $parent.data('loaded', true);
                loadLayer(layer, type);
            }
        }

        // filter objects now only if main layer has no sublayers
        if (is_init === false && $sublayers_wrapper.length == 0) {
            // filter objects only on "change" event, not on "init" event
            filterObjects();
        }
    });

    $(document).on('init change', '.layer-checkbox :checkbox', function(e, parent_checked) {
        var $this = $(this);
        var $main_layer = $this.parents('.layer').children('.layer-toggle');
        var $parent = $this.parent();
        var layer = $parent.data('sublayer');
        var type = $main_layer.data('type');
        var checked = $this.prop('checked');
        var parent_checked = parent_checked || $main_layer.find(':checkbox').prop('checked');
        var is_init = (e.type === 'init' ? true : false); // is "init" event

        // check if this sublayer is an active layer and set its visibility
        var index = layers.indexOf(layer);
        if (index !== -1 && checked === false) {
            layers.splice(index, 1);

            // save sublayer visibility state within data()
            if (is_init === true || e.originalEvent) {
                $parent.data('shown', false);
            }
        } else {
            if (checked === true) {
                layers.push(layer);

                // save sublayer visibility state within data()
                if (is_init === true || e.originalEvent) {
                    $parent.data('shown', true);
                }
            }
        }

        if (is_init === false) {
            // filter objects only on "change" event, not on "init" event
            filterObjects();
        }
    });

    $(document).on('change', '.clustering-checkbox :checkbox', function(e) {
        var $this = $(this);
        var objects_add = [];
        var objects_remove = [];

        clustering_enabled = $this.prop('checked');
        
        mapCluster.clearMarkers();

        $.each(objects, function(i, object) {
            if (object.visible === true || object.map !== null) {
                objects_add.push(object);
            } else {
                objects_remove.push(object);
            }
        });

        removeMapObjects(objects_remove);

        addMapObjects(objects_add);
    });

    $(document).on('change', '.satellite-view :checkbox', function(e) {
        e.preventDefault();

        var checked = $(this).prop('checked');

        if (checked) {
            map.setMapTypeId('satellite');
        } else {
            map.setMapTypeId('terrain');
        }
    });

    $(document).on('click', '.fullscreen-btn', function(e) {
        e.preventDefault();

        if (BigScreen.enabled) {
            BigScreen.toggle();
        }
    });

    BigScreen.onenter = function() {
        $('.fullscreen-btn').addClass('exit');
        $('.panel-header').show();
    }

    BigScreen.onchange = function() {
        console.log('fullscreen change');
    }

    BigScreen.onexit = function() {
        $('.panel').addClass('collapsed');
        $('.panel-header').hide();
        $('.fullscreen-btn').removeClass('exit');
    }

} ( this, jQuery ));