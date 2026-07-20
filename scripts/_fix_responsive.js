const fs = require("fs");

const filePath = process.argv[2];
let src = fs.readFileSync(filePath, "utf8");

const marker = "const styles = StyleSheet.create({";
const idx = src.indexOf(marker);
if (idx === -1) throw new Error("marker not found");

const head = src.slice(0, idx);
let body = src.slice(idx);

const lines = body.split("\n");

const round = (n) => Math.round(n);

const out = lines.map((line) => {
  // fontSize: width * X
  let m = line.match(/fontSize:(\s*)width(\s*)\*(\s*)([\d.]+)/);
  if (m) {
    const x = parseFloat(m[4]);
    const val = round(390 * x);
    return line.replace(/width(\s*)\*(\s*)([\d.]+)/, `normalize(${val})`).replace(/fontSize:(\s*)normalize/, "fontSize: normalize");
  }
  // fontSize: height * X
  m = line.match(/fontSize:(\s*)height(\s*)\*(\s*)([\d.]+)/);
  if (m) {
    const x = parseFloat(m[4]);
    const val = round(844 * x);
    return line.replace(/height(\s*)\*(\s*)([\d.]+)/, `normalize(${val})`).replace(/fontSize:(\s*)normalize/, "fontSize: normalize");
  }
  // fontSize: N  (plain literal)
  m = line.match(/fontSize:(\s*)(\d+)(\s*),/);
  if (m) {
    return line.replace(/fontSize:(\s*)(\d+)(\s*),/, (full, s1, num, s2) => `fontSize: normalize(${num}),`);
  }

  // width: width * X  (or any key: width * X)  -> scale(...)
  m = line.match(/width(\s*)\*(\s*)([\d.]+)/);
  if (m) {
    const x = parseFloat(m[3]);
    const val = round(390 * x);
    return line.replace(/width(\s*)\*(\s*)([\d.]+)/, `scale(${val})`);
  }

  // height: height * X -> verticalScale(...)
  m = line.match(/height(\s*)\*(\s*)([\d.]+)/);
  if (m) {
    const x = parseFloat(m[2] !== undefined ? m[2] : "");
    const xVal = line.match(/height\s*\*\s*([\d.]+)/)[1];
    const val = round(844 * parseFloat(xVal));
    return line.replace(/height(\s*)\*(\s*)([\d.]+)/, `verticalScale(${val})`);
  }

  // bare "width: width," -> SCREEN.width
  if (/:\s*width\s*,/.test(line) && !/SCREEN/.test(line)) {
    return line.replace(/:\s*width\s*,/, ": SCREEN.width,");
  }
  // bare "height: height," -> SCREEN.height
  if (/:\s*height\s*,/.test(line) && !/SCREEN/.test(line)) {
    return line.replace(/:\s*height\s*,/, ": SCREEN.height,");
  }

  return line;
});

body = out.join("\n");
fs.writeFileSync(filePath, head + body, "utf8");
console.log("done");
