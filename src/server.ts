import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get( "/filteredimage", async ( req, res, next ) => {
    const { image_url } = req.query;
    let imagePath: string;

    if (!image_url) {
      return res.status(400).send({ message: 'Image URL is required' });
    }

    try {
      imagePath = await filterImageFromURL(image_url);
    } catch(e) {
      return res.status(422).send({ message: 'Invalid image' });
    }

    if (imagePath) {
      res.sendFile(imagePath, function (err) {
        if (err) return next(err);
        
        deleteLocalFiles([imagePath]);
      });
    }
  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();