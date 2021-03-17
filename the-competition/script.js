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


    // Ranking
    var $table = $('#table');
    jQuery.getJSON('user_list.json', function(user_list){
        console.log(user_list)
        $('#table').bootstrapTable({
            data: user_list
        });
    })

};