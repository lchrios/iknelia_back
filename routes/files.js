var express = require('express');
var router = express.Router();


router.post('/', (req, res) => {
    // * Validates that the request contains a file
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({
            "message": 'No files were uploaded.',
            "success": false
        });
    }

    // * Parses file data
    telemetry = JSON.parse(req.files[''].data.toString());
    
    return res.status(200).send({ files: req.files });

})



module.exports = router;