(function() {
  'use strict';
  
  function getHeaderHeight() {
    var header = document.querySelector('.custom-header-belladona');
    return header ? header.offsetHeight : 80;
  }
  
  function closeMobileMenu() {
    var nav = document.getElementById('belladonaHeaderNav');
    var toggle = document.getElementById('belladonaMobileToggle');
    var overlay = document.getElementById('belladonaMobileOverlay');
    
    if (nav && nav.classList.contains('active')) {
      nav.classList.remove('active');
      toggle.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }
  
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        
        var targetId = href.substring(1);
        var target = document.getElementById(targetId);
        
        if (target) {
          e.preventDefault();
          var headerHeight = getHeaderHeight();
          var targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
          
          closeMobileMenu();
        }
      });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }
})();