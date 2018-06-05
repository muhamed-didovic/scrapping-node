'use strict';

window.$ = window.jQuery = require('jquery');
require('bootstrap-sass');

// required for jquery touch punch
// window.jQuery = $;
$(document).ready(function () {
  $('form button').click(e => {
    //let $this = $(e.currentTarget);
    //$this.attr('disabled', 'disabled');
    //$this.parents('form').submit();
    $('p').text("Please wait until Excel is generated.....").fadeOut(1e3);
  });

  $(".scrape").one("click", e => {
    const $this = $(e.currentTarget);
    $this.text('Processing...');
    $this.click(function () {
      return false;
    });
  });
});
