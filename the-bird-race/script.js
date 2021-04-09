window.onload = function () {

    // MAP
    map = L.map('mapid2');
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);

    jQuery.getJSON('checklist_list.json', function(checklist_list){

        var icon = L.AwesomeMarkers.icon({
            icon: 'coffee',
            iconColor: '#006382'
          });

        checklist_list.forEach(e => {
            console.log(e.Latitude)
            L.marker([e.Latitude, e.Longitude], {icon: icon})
            .bindPopup('<a href="https://ebird.org/profile/'+e.user_id+'">'+e.user_name+'</a><br>'+
            '<a href="https://ebird.org/checklist/'+e.user_subId+'">'+e.Location+'</a><br>'+
            'Number of Species: '+e.nb_species)
            .addTo(checklist_marker)
        });
        map.fitBounds(checklist_marker.getBounds());
    })

    // COUNTER
    var counter = [214,12,23,16] // species, observers, sightings, hours
    jQuery('.counter').each(function(i){
      var $this = $(this);
      $this.text(counter[i])
      jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
        duration: 1000,
        easing: 'swing',
        step: function () {
          $this.text(Math.ceil(this.Counter));
        }
      });
    })
    


    // Ranking
    var $table = $('#table');
    jQuery.getJSON('user_list.json', function(user_list){
        $('#table').bootstrapTable({
            data: user_list.map( x => { 
                x.user_name = '<a href="https://ebird.org/profile/'+x.user_id+'">'+x.user_name+'</a>';
                x.checklists = x.checklists.map(y => '<a href="https://ebird.org/checklist/'+y+'"><i class="fas fa-clipboard-list"></i></a>').join(' ');
                return x
            })
        });
    })

};