var expect = require('chai').expect;
const helpers = require('./helpers');

it('Detects Hawaiian words correctly', function(done) {
  var words = ["Mānoa", "humuhumunukunukuahupua'a", "Kuahelani"];
  console.log(words.map((w) => helpers.isHawaiian(w)));
  expect(words.map((w) => helpers.isHawaiian(w)).reduce((a,c) => a && c)).to.be.true;
  done();
});

it('Correctly outputs IPA of Hawaiian words', function(done) {
  var words = ["Mānoa", "humuhumunukunukuahupua'a", "Kuahelani", "Moana", "Lanakila", "hewa"];
  var targetIPA = ["manoə", "humuhumunukunukuəhupuəə", "kuəhɛləni", 'moənə', 'lənəkilə', 'hɛwə'];
  expect(words.map((w) => helpers.hawaiianPronunciation(w))).to.deep.equal(targetIPA);
  done();
});
