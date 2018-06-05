"use strict";

const expect = require('chai').expect;


describe('Check routes', function () {
  this.timeout(30e3);
  it('All links in top menu', () => {
    //visit homepage
    browser.url('/');
    expect(browser.getTitle()).to.be.equal('WATER');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/');
    expect(browser.getText('.title')).to.be.equal('WATER');

    //click on the logo of the website
    browser.click('.navbar-brand');
    expect(browser.getTitle()).to.be.equal('WATER');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/');
    expect(browser.getText('.title')).to.be.equal('WATER');

    //scrape page
    $('.nav').$$('li')[0].$('a').click();
    expect(browser.getTitle()).to.be.equal('WATER');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/scrape');
    expect(browser.getText('p')).to.be.equal('Successfully scraped 7 pages');

    //reports page
    //todo: add clicking on button and confirm that file has been downloaded
    $('.nav').$$('li')[1].$('a').click();
    expect(browser.getTitle()).to.be.equal('Reports');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/reports');
    expect(browser.getText('.panel-heading')).to.be.equal('Reports');

    //devices page
    $('.nav').$$('li')[2].$('a').click();
    expect(browser.getTitle()).to.be.equal('Devices');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/devices');
    expect(browser.getText('.panel-heading')).to.be.equal('Devices');

    //health page
    $('.nav').$$('li')[3].$('a').click();
    //browser.timeouts('page load', 10e3)
    expect(browser.getTitle()).to.be.equal('Health check');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/health');
    expect(browser.getText('.panel-heading')).to.be.equal('HEALTH CHECK STATUS');

    //info page
    $('.nav').$$('li')[4].$('a').click();
    expect(browser.getTitle()).to.be.equal('Info');
    expect(browser.getUrl()).to.be.equal('http://localhost:8082/info');
    expect(browser.getText('.panel-heading')).to.be.equal('Info');
  });

  describe('Devices page', function () {
    it('click on form elements on devices page', () => {
      //visit devices
      browser.url('/devices');
      expect(browser.getTitle()).to.be.equal('Devices');
      expect(browser.getUrl()).to.be.equal('http://localhost:8082/devices');
      expect(browser.getText('.panel-heading')).to.be.equal('Devices');
      //browser.debug();

      let deviceName = $('table > tbody > tr:nth-child(1) > td:nth-child(1)').getText();
      $('table > tbody > tr:nth-child(1) > td:nth-child(3) > a').click();
      expect(browser.getTitle()).to.be.equal('Edit device');

      //save old value
      let oldValue = $('table > tbody > tr:nth-child(2) > td:nth-child(2) > input').getValue();
      //console.log('oldValue', oldValue);
      let inputName = $('table > tbody > tr:nth-child(2) > td:nth-child(1)').getText();


      //Edit or change second element in a form
      browser.setValue('table > tbody > tr:nth-child(2) > td:nth-child(2) > input', 'new value');
      //browser.debug();
      //click update button
      $('.btn-primary').click();
      expect(browser.getTitle()).to.be.equal('Edit device');

      //check if new text is there
      console.log('2222', inputName);
      //browser.debug();
      expect($('input[name="'+inputName+'"]').getValue()).to.be.equal('new value');
      //expect($('table > tbody > tr:nth-child(2) > td:nth-child(2) > input').getValue()).to.be.equal('new value');

      /**
       * test deleting for a device
       */
      //click on devices link
      $('#app-navbar-collapse > ul > li:nth-child(3) > a').click();

      //remove first device in menu
      $('#app > div > div > div > div > div.panel-body > table > tbody > tr:nth-child(1) > td:nth-child(3) > form > button').click();

      //verify that is doesn't exist
      expect(browser.isExisting('='+ deviceName)).to.be.equal(false);

      //browser.debug();
    });
  });
});
