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


    const markerHtmlStyles = `
  background-color: #006382;
  width: 2rem;
  height: 2rem;
  display: block;
  left: -1rem;
  top: -1rem;
  position: relative;
  border-radius: 2rem 2rem 0;
  transform: rotate(45deg);
  border: 2px solid #FFFFFF`

  const icon = L.divIcon({
    className: "my-custom-pin",
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`
  })

    out.checklist_list.forEach(e => {
      L.marker([e.Latitude, e.Longitude], {
          icon: icon
        })
        .bindPopup('\
        <ul class="fa-ul">\
  <li><span class="fa-li"><i class="fas fa-dove text-blue"></i></span>'+e.nb_species+'</li>\
  <li><span class="fa-li"><i class="fas fa-clock text-blue"></i></span>'+e.Time+'</li>\
  <li><span class="fa-li"><i class="fas fa-users text-blue"></i></span><a target="_blank" href="https://ebird.org/profile/' + e.user_id + '">' + e.user_name + '</a> <small class="text-muted">(+'+e.number_of_observers+')</small></b></li>\
  <li><span class="fa-li"><i class="fas fa-map-marker text-blue"></i></span><a target="_blank" href="https://ebird.org/checklist/' + e.user_subId + '">' + e.Location + '</a></li>\
</ul>',{minWidth:200})//,{maxWidth: "auto"})
        .addTo(checklist_marker)
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
    //var $table = $('#table');
    $('#table').bootstrapTable({
      data: out.user_list.map(x => {
        var y={}
        y.nb_species = x.nb_species;
        y.user_name = '<a target="_blank" href="https://ebird.org/profile/' + x.user_id + '">' + x.user_name + '</a> <span class="flag-icon flag-icon-'+x.country[0].toLowerCase()+'"></span>' + ' <small class="text-muted">(<i class="fas fa-users"></i> '+x.number_of_observers+')</small>';
        y.checklists = x.checklists.map(y => '<a target="_blank" href="https://ebird.org/checklist/' + y + '"><i class="fas fa-clipboard-list"></i></a>').join(' ');
        return y
      }),
      classes:"table table-hover",
    });

  })


};