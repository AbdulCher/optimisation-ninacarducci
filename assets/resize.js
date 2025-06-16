const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputFolder = path.join(__dirname, "images/originals"); // Correction du chemin

const sizes = [
  { name: "thumbs", width: 300 },
  { name: "gallery", width: 500 },
  { name: "slider", width: 800 }
];

// Crée les dossiers de sortie
sizes.forEach(({ name }) => {
  const dir = path.join(__dirname, `images/${name}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Fonction pour parcourir récursivement les sous-dossiers
function getImagesRecursively(dir) {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getImagesRecursively(filePath));
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

// Redimensionne chaque image
getImagesRecursively(inputFolder).forEach((inputPath) => {
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);

  sizes.forEach(({ name, width }) => {
    const outputPath = path.join(__dirname, `images/${name}/${baseName}.webp`);

    sharp(inputPath)
      .resize({ width })
      .toFormat("webp")
      .toFile(outputPath)
      .then(() =>
        console.log(`✅ ${path.relative(__dirname, inputPath)} → ${name}/${baseName}.webp`)
      )
      .catch((err) =>
        console.error(`❌ ${path.relative(__dirname, inputPath)} (${name}):`, err)
      );
  });
});
