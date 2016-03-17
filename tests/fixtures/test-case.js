var expect = require('expect.js'),
    _ = require('lodash'),
    htmlparser2 = require('htmlparser2'),
    $ = require('../'),
    fixtures = require('./fixtures'),
    fruits = fixtures.fruits,
    food = fixtures.food;

// HTML
var script = '<script src="script.js" type="text/javascript"></script>',
    multiclass = '<p><a class="btn primary" href="#">Save</a></p>';

describe('cheerio', function() {

  it('should get the version', function() {
    expect(/\d+\.\d+\.\d+/.test($.version)).to.be.ok();
  });

  it('$(null) should return be empty', function() {
    expect($(null)).to.be.empty();
  });

  it('$(undefined) should be empty', function() {
    expect($(undefined)).to.be.empty();
  });

  it('$(null) should be empty', function() {
    expect($('')).to.be.empty();
  });

  it('$(selector) with no context or root should be empty', function() {
    expect($('.h2')).to.be.empty();
    expect($('#fruits')).to.be.empty();
  });

  it('$(node) : should override previously-loaded nodes', function() {
    var C = $.load('<div><span></span></div>');
    var spanNode = C('span')[0];
    var $span = C(spanNode);
    expect($span[0]).to.equal(spanNode);
  });

  it('should be able to create html without a root or context', function() {
    var $h2 = $('<h2>');
    expect($h2).to.not.be.empty();
    expect($h2).to.have.length(1);
    expect($h2[0].tagName).to.equal('h2');
  });

  it('should be able to create complicated html', function() {
    var $script = $(script);
    expect($script).to.not.be.empty();
    expect($script).to.have.length(1);
    expect($script[0].attribs.src).to.equal('script.js');
    expect($script[0].attribs.type).to.equal('text/javascript');
    expect($script[0].childNodes).to.be.empty();
  });
});