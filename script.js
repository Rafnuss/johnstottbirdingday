jQuery.getJSON('/stories.json', function(stories){
    console.log(stories)
    cards = stories.map( (story,id) => {
        return `<div class="col-sm-3">
        <div class="card-header">` + story.author + `</div>
            <div class="card">
                ` + (story.photos.length>0 ? '<img src="/assets/stories/'+story.photos[0]+'">' : '') + ` 
                <div class="card-body">
                    <h5 class="card-title">` + story.author + `</h5>
                    <p class="card-text">` + shorten(story.body,70) + `</p>
                    <a href="" data-bs-toggle="modal" data-bs-target="#modal-`+id+`" >Read more...</a>
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

    modal = stories.map( (story,id) => {
        return `<!-- Modal -->
        <div class="modal fade" id="modal-`+id+`" tabindex="-1" aria-labelledby="modal-`+id+`-label" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal-`+id+`-label">` + story.author + `</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                `+story.body + story.photos.reduce( (ac,cu) => ac+'<img class="img-fluid" src="/assets/stories/'+cu+'">','')+`
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
            </div>
        </div>
        </div>`
    })

    jQuery('body').append(modal.join(''))
})

window.onload = function() {
    var map = L.map('mapid',{ zoomControl: false })
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);
    jQuery.getJSON('the-competition/checklist_list.json', function(checklist_list){
        checklist_list.forEach(e => {
            L.marker([e.Latitude, e.Longitude])
            .bindPopup('<a href="https://ebird.org/profile/'+e.user_id+'">'+e.user_name+'</a><br>'+
            '<a href="https://ebird.org/checklist/'+e.user_subId+'">'+e.Location+'</a><br>'+
            'Number of Species: '+e.nb_species)
            .addTo(checklist_marker)
        });
        map.fitBounds(checklist_marker.getBounds());
    })
  };

window.onscroll = function() {
    if (document.documentElement.scrollTop > 80) {
      document.getElementById("nav-logo").style.height = "40px";
    } else {
      document.getElementById("nav-logo").style.height = "70px";
  }
};

function shorten(str, maxLen, separator = ' ') {
    str = str.replace(/(<([^>]+)>)/gi, "");
    if (str.length <= maxLen) return str;
    var str_return = str.substr(0, str.lastIndexOf(separator, maxLen))
    return str_return+'...';
  }