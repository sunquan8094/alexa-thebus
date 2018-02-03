exports.isHawaiian = (w) => w.toLowerCase().match(/([hklmnpw']?[aeiouāēīōū])+/) !== null &&
  w.length === w.toLowerCase().match(/([hklmnpw']?[aeiouāēīōū])+/)[0].length;

exports.hawaiianPronunciation = function(w) {
  const ipa = "hklmnpwəɛiouaɛiou";
  const hwn = "hklmnpwaeiouāēīōū";
  return w.toLowerCase().split("").map((l) => {
    if (hwn.indexOf(l) > -1) return ipa.charAt(hwn.indexOf(l));
    else return "";
  }).join("");
};
