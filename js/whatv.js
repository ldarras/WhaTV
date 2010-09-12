'use strict';
var $;
(function(window, undefined) {
// Inside of our object, we will always refer to 'whaTV' to fetch attributes.
var whaTV = {
  defaults: {
    // The html fetching method.
    // Can be one of the following : 'ajax' | 'iframe'
    htmlMethod: 'iframe'
  },
  // Pointer to current slide
  pointer: 0,

  // The informations about slides to show
  slides: [],

  // Current loaded slide as a DOM node
  // TODO replace it by array, to store past slides in memory?
  //loadedSlide: null,

  // Boolean to know if next slide is ready to show
  ready: false,

  // The current version of whaTV being used
  version: '0.0.1',

  init: function() {
    // Reference to self
    var whaTV = this;
    // Getting slides
    $.getJSON('slides.json', whaTV.showFirstSlide);
  },

  showFirstSlide: function(data) {
    whaTV.slides = data.slides;
    // TODO : loading screen
    $('#content1').hide();
    whaTV.loadPointedSlideIntoDOM();
  },

  // Load into the DOM the pointed slide and its elements. Fire an event
  // notifyReadyOrGo when Everything is loaded.
  loadPointedSlideIntoDOM: function() {
    console.log('loadPointedSlideIntoDOM called. preparing slide number ' +
                whaTV.pointer);
    whaTV.ready = false;
    var currentSlide = whaTV.slides[whaTV.pointer],
        content,
        hiddenContentDiv;
    switch (currentSlide.type) {
      case 'html':
        console.debug('HTML file detected');
        content = whaTV.defaults.htmlMethod ? whaTV.loadIframe() :
                                              whaTV.loadIframe();
        break;
      case 'flash':
        console.debug('Flash file detected');
        content = whaTV.loadFlash();
        break;
      case 'image':
        console.debug('Image file detected');
        content = whaTV.loadImage();
        break;
      case 'video':
        console.debug('Video file detected');
        content = whaTV.loadVideo();
        //content.addEventListener('ended', whaTV.onSlideTimeout, false);
        break;
    }
    hiddenContentDiv = $('#content' +
                             whaTV.getPointerModuloTwoPlusOne()
                            )[0];
    console.debug('Clearing content' + whaTV.getPointerModuloTwoPlusOne());
    whaTV.clearNode(hiddenContentDiv);
    console.debug('Load content' + whaTV.getPointerModuloTwoPlusOne());
    hiddenContentDiv.appendChild(content);
    // XXX : This is hightly experimental
    //if(content.play) ambiLight.create(content);
    // Simulating fire event when complete
    setTimeout(whaTV.onNextSlideReady, Math.random() * 2000);
  },

  makeTransition: function() {
    console.log('makeTransition called. Showing slide number ' + whaTV.pointer);
    console.debug('Hidding content' + whaTV.getPointerModuloTwo());
    $('#content' + whaTV.getPointerModuloTwo()).hide();
    if ($('#content' + whaTV.getPointerModuloTwo() + ' video')[0]) {
      $('#content' + whaTV.getPointerModuloTwo() + ' video')[0].pause();
    }
    console.debug('Showing content' + whaTV.getPointerModuloTwoPlusOne());
    $('#content' + whaTV.getPointerModuloTwoPlusOne()).show();
    if ($('#content' + whaTV.getPointerModuloTwoPlusOne() + ' video')[0]) {
      $('#content' + whaTV.getPointerModuloTwoPlusOne() + ' video')[0].play();
    }
    whaTV.notifyReadyOrGo = function() {whaTV.ready = true;};
    setTimeout(whaTV.onSlideTimeout,
               whaTV.slides[whaTV.pointer].timeout * 1000);
    whaTV.incrementPointer();
    whaTV.loadPointedSlideIntoDOM();
  },

  onSlideTimeout: function() {
    if (whaTV.ready) {
      whaTV.makeTransition();
    }
    else {
      whaTV.notifyReadyOrGo = function() {whaTV.makeTransition();};
    }
  },

  onNextSlideReady: function() {
    whaTV.notifyReadyOrGo();
  },
  notifyReadyOrGo: function() {
    // This function will be overwritten by makeTransition and onSlideTimeout
    // This code is used as is ONLY for first iteration
    whaTV.makeTransition();
  },

  // Increments the pointer. If last slide has been reached, we start again.
  incrementPointer: function() {
    whaTV.pointer = whaTV.pointer + 1;
    if (whaTV.pointer === whaTV.slides.length) {whaTV.pointer = 0;}
  },


  // Loaders
  loadIframe: function() {
    var iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('src', whaTV.slides[whaTV.pointer].resource);
    iframe.setAttribute('class', 'next_content');
    iframe.setAttribute('id', whaTV.pointer);
    iframe.setAttribute('scrolling', "no");
    // XXX : May be used to fire the onNextSlideReady event?
    //iframe.onload = function(){alert("lol")};
    return iframe;
  },

  loadImage: function() {
    // XXX : What about Image() preloading?
    var image = document.createElement('img');
    image.setAttribute('src', whaTV.slides[whaTV.pointer].resource);
    image.setAttribute('class', 'slide');
    return image;
  },

  loadVideo: function() {
    var videoContainerDiv = document.createElement('div'),
        video = document.createElement('video'),
        resources = whaTV.slides[whaTV.pointer].resources,
        source,
        index;
    videoContainerDiv.setAttribute('class', 'video_container');
    for (index in resources) {
      source = document.createElement('source');
      source.setAttribute('src', resources[index].resource);
      source.setAttribute('type', resources[index].codec);
      video.appendChild(source);
    }
    video.preload = true;
    videoContainerDiv.appendChild(video);
    return videoContainerDiv;
  },

  loadFlash: function(){
    var flash = document.createElement('embed');
    flash.setAttribute('src', whaTV.slides[whaTV.pointer].resource);
    flash.setAttribute('pluginspage', 'http://www.adobe.com/go/getflashplayer');
    flash.setAttribute('type', 'application/x-shockwave-flash');
    return flash;
  },


  // Utilities
  clearNode: function(node) {
    if (node.hasChildNodes()) {
      while (node.childNodes.length >= 1) {
        node.removeChild(node.firstChild);
      }
    }
  },

  getPointerModuloTwo: function() {
    return 2 - whaTV.pointer % 2;
  },

  getPointerModuloTwoPlusOne: function() {
    return whaTV.pointer % 2 + 1;
  }


  /*// Some ideas to some simpler event system
  onSlideTimeout2: function() {
    if (whaTV.ready) {
      whaTV.makeTransition();
    }
    else {
      whaTV.madeTransition = true;
    }
  },

  onNextSlideReady2: function() {
    if (whaTV.madeTransition) {
      whaTV.makeTransition();
    }
    else {
      whaTV.ready = true;
    }
  },*/
};

whaTV.init();

// Expose whaTV to the global object for debugging purposes
window.w = whaTV;
window.pause = function() {
  whaTV.ready = false;
  whaTV.notifyReadyOrGo = function() {return null;};
}
})(window);
