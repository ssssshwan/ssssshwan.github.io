(function () {
  'use strict';

  function initializeSite() {
    var newsItems = Array.prototype.slice.call(
      document.querySelectorAll('.news-item'),
    );
    var newsToggle = document.querySelector('[data-news-toggle]');
    var papers = Array.prototype.slice.call(
      document.querySelectorAll('.paper-entry[data-selected]'),
    );
    var filterButtons = Array.prototype.slice.call(
      document.querySelectorAll('[data-filter]'),
    );
    var filterGroup = document.querySelector('.paper-filter');
    var videos = Array.prototype.slice.call(
      document.querySelectorAll('video[data-src]'),
    );
    var observerSupported = 'IntersectionObserver' in window;

    function setNewsExpanded(expanded) {
      newsItems.forEach(function (item, index) {
        item.hidden = !expanded && index >= 3;
      });
      newsToggle.setAttribute('aria-expanded', String(expanded));
      newsToggle.textContent = expanded ? 'Show less' : 'Show more';
    }

    function prefersReducedMotion() {
      var reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      return reduceMotion;
    }

    function loadVideo(video) {
      if (!video.dataset.src) return;

      video.src = video.dataset.src;
      video.removeAttribute('data-src');
      video.load();
    }

    function playVideo(video) {
      if (!prefersReducedMotion() && video.paused) {
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            // Autoplay can be blocked by a browser policy; the poster remains visible.
          });
        }
      }
    }

    function isInHiddenPaper(video) {
      var paper =
        typeof video.closest === 'function' ? video.closest('.paper-entry') : null;
      return Boolean(paper && paper.hidden);
    }

    function setPaperFilter(filter) {
      papers.forEach(function (paper) {
        var shouldHide = filter === 'selected' && paper.dataset.selected !== 'true';
        var paperVideos =
          typeof paper.querySelectorAll === 'function'
            ? Array.prototype.slice.call(paper.querySelectorAll('video'))
            : [];
        paper.hidden = shouldHide;

        if (shouldHide) {
          paperVideos.forEach(function (video) {
            if (!video.paused) video.pause();
          });
        } else if (!observerSupported) {
          paperVideos.forEach(function (video) {
            loadVideo(video);
            playVideo(video);
          });
        }
      });

      filterButtons.forEach(function (button) {
        var isActive = button.dataset.filter === filter;
        button.setAttribute('aria-pressed', String(isActive));
        if (isActive) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }

    if (newsToggle && newsItems.length > 3) {
      newsToggle.addEventListener('click', function () {
        setNewsExpanded(newsToggle.getAttribute('aria-expanded') !== 'true');
      });
      setNewsExpanded(false);
      newsToggle.hidden = false;
    }

    videos.forEach(function (video) {
      video.controls = true;
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setPaperFilter(button.dataset.filter);
      });
    });

    setPaperFilter('selected');
    if (filterGroup) filterGroup.hidden = false;

    if (observerSupported) {
      var observer = new window.IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !isInHiddenPaper(entry.target)) {
              loadVideo(entry.target);
              playVideo(entry.target);
            } else if (!entry.target.paused) {
              entry.target.pause();
            }
          });
        },
        { threshold: 0.1 },
      );

      videos.forEach(function (video) {
        observer.observe(video);
      });
    } else {
      videos.forEach(function (video) {
        if (!isInHiddenPaper(video)) {
          loadVideo(video);
          playVideo(video);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSite);
  } else {
    initializeSite();
  }
})();
