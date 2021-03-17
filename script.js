var stories
jQuery.getJSON('https://sheets.googleapis.com/v4/spreadsheets/1nsrEIrjH08yZ1mbJE8XpiwPfU0ol2ugTal2mT-9DZnk/values/Sheet1!A1:E50?key=AIzaSyBa0wvOE3H9mSaQYC4bA3bXRHEPAtbgwow', function(d){
    d = d.values;
    stories = d.slice(1, d.length).map( (story_array) => {
        story = story_array.reduce( (acc,curr,i) => {
            acc[d[0][i]] = curr;
            return acc
        }, {})
        return story
    })

    cards = stories.map(story => {
        return `<div class="col-sm-3">
            <div class="card">
                ` + (story.featured=='TRUE' ? '<div class="card-header">Featured</div>' : '') + ` 
                ` + (story.imageUrl ? '<img src="'+story.imageUrl+'">' : '') + ` 
                <div class="card-body">
                    <h5 class="card-title">` + (story.author ? story.author : '') + `</h5>
                    <p class="card-text">` + (story.message ? story.message : '') + `</p>
                    <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
                </div>
            </div>
        </div>`
    });


    var html = ""             
    for (var i = 0; i < cards.length; i++) {
        if (i==0){
            html += '<div class="carousel-item active"><div class="row justify-content-center">'
        } else if (i%3==0){
            html += '<div class="carousel-item"><div class="row justify-content-center">'
        }
        html += cards[i]
        if (i%3==2){
            html += '</div></div>'
        } else if (i==cards.length){
            html += '</div></div>'
        }
    }
    jQuery('#carouselStories .carousel-inner').prepend(html)
})

window.onload = function() {
    var map = L.map('mapid',{ zoomControl: false })
    L.tileLayer.provider('Stamen.Watercolor').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);
    jQuery.getJSON('the-competition/checklist_list.json', function(checklist_list){
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
  };