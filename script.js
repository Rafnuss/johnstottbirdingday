jQuery.getJSON('/stories.json', function(stories){
    //console.log(stories)
    cards = stories.map( (story,id) => {
        return `<div class="col-sm-3  my-2">
            <div class="card">
                ` + (story.photos.length>0 ? '<img class="img-fluid" src="/assets/stories/'+story.photos[0]+'">' : '') + ` 
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

auction_id = ['sdasda','dsfsdf','sdgsad','g3dcxc','gress','agdfg','grdfghsa','fhawxccv','trhefgs','sdfhdcg','sfgersdvch'];

window.onload = function() {
    map = L.map('mapid',{ zoomControl: false }).fitBounds([[7,-270], [-51, 90]]);
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    checklist_marker = L.featureGroup().addTo(map);
    /*
    Uncomment during the day
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
    */

    var cols = auction_id.map( (id,idx) =>{
        return `<div class="col-sm-3 " id="auction-col-`+idx+`">
        <div class="bg-blue text-white text-center">`
        +id+
        `</div></div>`
    })
    var html = ""
    u=0        
    for (var i = 0; i < cols.length; i++) {
        if (i%4==0){
            u=u+1;
            html += '<div class="row auction-row" id="auction-row-'+u+'">'; 
            jQuery('.page-item:last-child').before('<li class="page-item" id="page-item-'+u+'"><a class="page-link">'+u+'</a></li>')
        }
        html += cols[i]
        if (i%4==3 | i==cols.length){
            html += '</div>'
        }
    }
    jQuery('#auction-nav').after(html)
    jQuery('.auction-row').hide()
    jQuery('.auction-row:first').show()
    jQuery('.page-item:nth-child(2)').addClass('active')
    jQuery('.page-link').on('click', (e)=>{
        var us = e.target.innerText;
        if (us=="«"){
            us = Math.max(parseInt(jQuery('.page-item.active').text())-1,1);
        } else if (us=="»") {
            us = Math.min(parseInt(jQuery('.page-item.active').text())+1,u);
        }
        jQuery('.page-item').removeClass('active')
        jQuery('#page-item-'+us).addClass('active') 

        jQuery('.auction-row').hide()
        jQuery('#auction-row-'+us).show()
        
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