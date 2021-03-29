window.onload = function () {

    // MAP
    map = L.map('mapid');
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);

    jQuery.getJSON('checklist_list.json', function(checklist_list){
        console.log(checklist_list)
        checklist_list.forEach(e => {
            console.log(e.Latitude)
            L.marker([e.Latitude, e.Longitude])
            .bindPopup('<a href="https://ebird.org/profile/'+e.user_id+'">'+e.user_name+'</a><br>'+
            '<a href="https://ebird.org/checklist/'+e.user_subId+'">'+e.Location+'</a><br>'+
            'Number of Species: '+e.nb_species)
            .addTo(checklist_marker)
        });
        map.fitBounds(checklist_marker.getBounds());
    })


    jQuery.getJSON('species_list_sp_only.json', function(species_list){
        jQuery('#species-nb').html(species_list.length)
    })


    // Ranking
    var $table = $('#table');
    jQuery.getJSON('user_list.json', function(user_list){
        console.log(user_list)
        jQuery('#users-nb').html(user_list.length)
        $('#table').bootstrapTable({
            data: user_list.map( x => { 
                x.user_name = '<a href="https://ebird.org/profile/'+x.user_id+'">'+x.user_name+'</a>';
                x.checklists = x.checklists.map(y => '<a href="https://ebird.org/checklist/'+y+'"><i class="fas fa-clipboard-list"></i></a>').join(' ');
                return x
            })
        });
    })

};