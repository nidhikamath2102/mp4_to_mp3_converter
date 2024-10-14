const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const port = 3000;
const app = express();

const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), (req, res) => {
  const input_path = req.file.path;
  const output_path = path.join('uploads', `${req.file.filename}.mp3`);

  ffmpeg(input_path)
    .toFormat('mp3')
    .on('end', () => {
      res.download(output_path, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error sending file');
        } else {
          fs.unlinkSync(input_path);
          fs.unlinkSync(output_path);
        }
      });
    })
    .on('error', (err) => {
      console.error('Error converting:', err);
      console.error('Input path:', input_path);
      console.error('Output path:', output_path);
      res.status(500).send('Conversion failed');
    })
    .save(output_path);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//Postman Request
// curl --location 'http://localhost:3000/convert' \
// --form 'file=@"/path/to/file"'