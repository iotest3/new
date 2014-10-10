
/* global document: true */

(function() {
  'use strict';

  // Browser detection, copied from:
  // https://github.com/jquery/jquery-migrate/blob/master/src/core.js
  function uaMatch(ua) {
    ua = ua.toLowerCase();
    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
      /(msie) ([\w.]+)/.exec(ua) ||
      ua.indexOf('compatible') < 0 &&
      /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
      [];
    return {
      browser: match[1] || '',
      version: match[2] || '0'
    };
  }

  // Show the status on the top of the page
  function showStatus(html) {
    window.onload = function() {
      var div = document.createElement("div");
      div.style.width = '100%';
      div.style.background = '#eddb33';
      div.style.color = 'black';
      div.style.padding = '0.75em';
      div.style.fontSize = '14px';
      div.innerHTML = html;
      document.body.insertBefore(div, document.body.firstChild);
    };
  }

  var browser_upgrade_url = document
    .getElementById('karl-browser-upgrade-url').getAttribute('content');
  if (browser_upgrade_url) {
    var matched = uaMatch(navigator.userAgent);
    if (matched.browser.msie && parseInt(browser.version, 10) < 9) {
      showStatus([
        '<table style="width: 100%; height: 30px;">',
          '<tr>',
            '<td style="text-align: center; vertical-align: middle;">',
              'You are using a version of Internet Explorer below KARL\'s minimum of IE9.',
                '<a href="' + browser_upgrade_url + '">',
                  'Please upgrade your browser.',
                '</a>',
            '</td>',
          '</tr>',
        '</table>'
      ].join(' '));
    }
  }

})();
