const gradient = require('gradient-string');
const router = require("express").Router();
const { readdirSync, readFileSync } = require('fs-extra');
const path = require('path');

try {
  // ------------------------------------------------------------------------//
  // ------------------------/     Public folder    /-------------------------//
  // ------------------------------------------------------------------------//
  var i, n = 0;
  const srcPath = path.join(__dirname, "/public/");
  const hosting = readdirSync(srcPath).filter((file) => file.endsWith(".js"));
  for (i of hosting) {
    const { index, name } = require(srcPath + i);
    router.get(name, index);
    n++;
    console.log(gradient.instagram(i));
  }

  // ------------------------------------------------------------------------//
  // ----------------------------/     Public    /----------------------------//
  // ------------------------------------------------------------------------//
  const getDirs = readdirSync(srcPath).filter((file) => !file.endsWith(".js") && !file.endsWith(".json"));
  for (const dir of getDirs) {
    const fileName = readdirSync(path.join(__dirname, '/public/' + dir + '/')).filter((file) => file.endsWith(".js"));
    for (i of fileName) {
      const { index, name } = require(path.join(__dirname, '/public/' + dir + '/') + i);
      router.get(name, index);
      n++;
      console.log(gradient.instagram(`[ LOADING ] → Successfully loaded ${i}`));
    }
  }

  console.log(gradient.rainbow(`[ LOADING ] → Successfully loaded ${n} API files`));
} catch (e) {
  console.log(e);
}

// -------------------------->      END     <------------------------------//
module.exports = router;
