color_pin=['#efa00b','#d65108','#591f0a','#eee5e5','#adb6c4','#89023e','#ffd9da','#c7d9b7','#17bebb']//['#271F30','#C8AD55','#D0FCB3','#9BC59D','#5BC0EB','#C3423F','#F9E9EC','#F88DAD']


window.onload = function () {
    
    // MAP
    map = L.map('mapid2').fitWorld();
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);
    
    sidebarhide = function() {
        jQuery('#sidebar').attr('style','display:none !important');
        jQuery('#mapid2').removeClass('col-md-8').addClass('col-md-12')
        $('#easybutton').show()
        map.invalidateSize();
    }
    
    sidebarshow = function(){
        jQuery('#sidebar').attr('style','display:block !important');
        jQuery('#mapid2').addClass('col-md-8').removeClass('col-md-12')
        $('#easybutton').hide()
        map.invalidateSize();
    }
    
    L.easyButton('fa-caret-right', sidebarshow ,{id:"easybutton"}).addTo( map );
    
    
    
    $.getJSON('out.json', function (out) {
        
        /*var icon = L.AwesomeMarkers.icon({
            icon: 'clipboard-list',
            prefix: "fa",
            iconColor: '#006382',
            markerColor: "white"
        });*/
        
        var unique_user = [...new Set(out.checklist_list.map( e => e.user_name))]
        
        const markerHtmlStyles = `
        width: 2rem;
        height: 2rem;
        display: block;
        left: -1rem;
        top: -1rem;
        position: relative;
        border-radius: 2rem 2rem 0;
        transform: rotate(45deg);
        border: 1px solid #000000;`

        out.checklist_list.forEach( e => {
            
            var id = unique_user.indexOf(e.user_name)
            
            var m = L.marker([e.Latitude, e.Longitude], {
                icon: L.divIcon({
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `<span style="${markerHtmlStyles+ 'background-color: '+ color_pin[id % color_pin.length] + ';'}" />`
                })
            })
            .bindPopup(`
            <ul class="fa-ul">
            <li><span class="fa-li"><i class="fas fa-dove text-blue"></i></span>`+e.nb_species+`</li>
            <li><span class="fa-li"><i class="fas fa-clock text-blue"></i></span>`+e.Time+`</li>
            <li><span class="fa-li"><i class="fas fa-users text-blue"></i></span>`+ (e.user_id=='' ? e.user_name : ('<a target="_blank" href="https://ebird.org/profile/' + e.user_id + '">' + e.user_name + '</a>') )  +  ' <small class="text-muted">(+'+e.number_of_observers+`)</small></b></li>
            <li><span class="fa-li"><i class="fas fa-map-marker text-blue"></i></span><a target="_blank" href="https://ebird.org/checklist/` + e.user_subId + `">` + e.Location + `</a></li>\
            </ul>`,{minWidth:200})//,{maxWidth: "auto"})

            m.id=id;
            m.addTo(checklist_marker)
        });
        
        
        map.fitBounds(checklist_marker.getBounds());
        
        // COUNTER
        jQuery('.counter').each(function (i) {
            var $this = $(this);
            $this.text(out.counter[i])
            jQuery({
                Counter: 0
            }).animate({
                Counter: $this.text()
            }, {
                duration: 1000,
                easing: 'swing',
                step: function () {
                    $this.text(Math.ceil(this.Counter));
                }
            });
        })
        
        // Ranking
        
        user_table = out.user_list.map((x,index) => {
            var y={}
            y.nb_species = x.nb_species;
            y.user_name = (x.user_id=='' ? x.user_name : ('<a target="_blank" href="https://ebird.org/profile/' + x.user_id + '">' + x.user_name + '</a>') ) + ' <small class="text-muted">(<i class="fas fa-users"></i> '+x.number_of_observers+')</small>';
            //y.checklists = x.checklists.map(y => '<a target="_blank" href="https://ebird.org/checklist/' + y + '"><i class="fas fa-clipboard-list"></i></a>').join(' ');
            y.country = ' <span class="flag-icon flag-icon-'+x.country[0].toLowerCase()+'"></span>'
            y.id = unique_user.indexOf(x.user_name)
            y.index = index
            return y
        })
        
        $('#table').bootstrapTable({
            data: user_table,
            classes:"table table-hover",
            onClickRow: function(e){
                console.log(e)
                checklist_marker_zoom =  L.featureGroup();
                checklist_marker.eachLayer(function (layer) {
                    if (layer.id==e.id) {
                        layer.addTo(checklist_marker_zoom)
                        map.fitBounds(checklist_marker_zoom.getBounds());
                    }
                })
            },
            onPostBody: function(){
                var trs = $('#table').find('tbody').children();
                
                for (var i = 0; i < trs.length; i++) {
                    $(trs[i]).mouseover(function(e) {
                        index = $(e.currentTarget).data('index')
                        var id = user_table.filter( e => e.index==index)[0].id
                        $(this).css("background-color",color_pin[id % color_pin.length])
                        checklist_marker.eachLayer(function (layer) {
                            if (layer.id==id) {
                                layer.setOpacity(1)
                                /*layer.setIcon(L.divIcon({
                                    iconAnchor: [0, 24],
                                    labelAnchor: [-6, 0],
                                    popupAnchor: [0, -36],
                                    html: `<span style="${markerHtmlStyles+ 'background-color: '+ color_pin[id % color_pin.length] + ';'}" />`
                                }))*/
                            } else {
                                layer.setOpacity(0)
                                /*layer.setIcon(L.divIcon({
                                    iconAnchor: [0, 24],
                                    labelAnchor: [-6, 0],
                                    popupAnchor: [0, -36],
                                    html: `<span style="${markerHtmlStyles+ 'background-color: #212529;'}" />`
                                }))*/
                            }
                        });
                    }).mouseout(function(e) {
                        $(this).css("background-color","transparent")
                        checklist_marker.eachLayer(function (layer) {
                            layer.setOpacity(1)
                            /*layer.setIcon(L.divIcon({
                                iconAnchor: [0, 24],
                                labelAnchor: [-6, 0],
                                popupAnchor: [0, -36],
                                html: `<span style="${markerHtmlStyles+ 'background-color: '+ color_pin[layer.id % color_pin.length] + ';'}" />`
                            }))*/
                        });
                    });            
                };
            }
        })
        
    })
    
    
    
    
    
};