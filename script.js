jQuery.getJSON('/stories.json', function(stories){
    //console.log(stories)
    cards = stories.map( (story,id) => {
        return `<div class="col-sm-3  my-2">
            <div class="card">
                ` + (story.photos.length>0 ? '<img class="img-fluid" src="/assets/stories/'+story.photos[0]+'">' : '<img class="img-fluid" src="/assets/stories/empty.jpg">') + ` 
                <div class="card-body">
                    <h5 class="card-title">` + story.author + `</h5>
                    <p class="card-text">` + shorten(story.body,70) + `</p>
                    <a href="" data-bs-toggle="modal" data-bs-target="#modal-`+id+`" >Read more...</a>
                </div>
            </div>
        </div>`
        //<div class="card-header">` + story.author + `</div>
    });

    var html = ""
    if (jQuery(window).width() < 576) {
        for (var i = 0; i < cards.length; i++) {
            if (i==0){
                html += '<div class="carousel-item active" data-bs-interval="10000"><div class="row justify-content-center">'
            } else {
                html += '<div class="carousel-item" data-bs-interval="10000"><div class="row justify-content-center">'
            }
            html += cards[i]
            html += '</div></div>'
        }
    }  else{
        for (var i = 0; i < cards.length; i++) {
            if (i==0){
                html += '<div class="carousel-item active " data-bs-interval="10000"><div class="row justify-content-center">'
            } else if (i%3==0){
                html += '<div class="carousel-item" data-bs-interval="10000"><div class="row justify-content-center">'
            }
            html += cards[i]
            if (i%3==2){
                html += '</div></div>'
            } else if (i==cards.length){
                html += '</div></div>'
            }
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


jQuery.getJSON('/auctions.json', function(auctions){
    var cols = auctions.map( (auc,idx) =>{
        return `
        <a class="grid-item col-12 col-sm-6 col-lg-4 p-2 p-lg-4" href="https://www.jumblebee.co.uk/johnstottbirding#buzz_expend_`+ auc.linkId +`" target="_blank">
        <div class="bg-blue text-white text-center p-3 rounded">
        <img class="img-fluid p-4" src="/assets/auctions/`+ auc.linkId +`.jpg">
        <h5>`+auc.title+`</h5>
        </div></a>`
    })
    jQuery('#auction-row').html(cols.join(''))
    jQuery('.grid').imagesLoaded( function() {
        jQuery('.grid').masonry({
        itemSelector: '.grid-item',
      });
    });
})


window.onload = function() {
    map = L.map('mapid',{ zoomControl: false }).fitBounds([[7,-270], [-51, 90]]);
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);
    
    //Uncomment during the day
    const markerHtmlStyles = `
        width: 2rem;
        height: 2rem;
        display: block;
        left: -1rem;
        top: -1rem;
        position: relative;
        border-radius: 2rem 2rem 0;
        transform: rotate(45deg);
        border: 1px solid #000000;
        background-color:#006382;`

    jQuery.getJSON('the-bird-race/out.json', function(out){
        out.checklist_list.forEach(e => {
            var m = L.marker([e.Latitude, e.Longitude], {
                icon: L.divIcon({
                    iconAnchor: [0, 24],
                    labelAnchor: [-6, 0],
                    popupAnchor: [0, -36],
                    html: `<span style="${markerHtmlStyles}" />`
                })
            }).addTo(checklist_marker)
        });
        map.fitBounds(checklist_marker.getBounds());

        user_table = out.user_list.map((x,index) => {
            var y={}
            y.ranking = index+1,
            y.nb_species = x.nb_species;
            y.user_name = (x.user_id=='' ? x.user_name : ('<a target="_blank" href="https://ebird.org/profile/' + x.user_id + '">' + x.user_name + '</a>') ) + ' <small class="text-muted">(<i class="fas fa-users"></i> '+x.number_of_observers+')</small>';
            //y.checklists = x.checklists.map(y => '<a target="_blank" href="https://ebird.org/checklist/' + y + '"><i class="fas fa-clipboard-list"></i></a>').join(' ');
            y.user_name += '  <span class="flag-icon flag-icon-'+x.country[0].toLowerCase()+'"></span>'
            return y
        })

        $('#table').bootstrapTable({
            data: user_table.slice(0,5),
            classes:"table table-hover",
        })

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