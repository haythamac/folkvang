const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved maps',
        data: [
            {
                name: "Inter Folkvang",
                respawn_type: "fixed",
                respawn_min_seconds: 7200,
                respawn_max_seconds: 7200
            },
            {
                name: "Normal Folkvang",
                respawn_type: "fixed",
                respawn_min_seconds: 7200,
                respawn_max_seconds: 7200
            },
            {
                name: "Myrkrheim",
                respawn_type: "range",
                respawn_min_seconds: 1800,
                respawn_max_seconds: 3600
            },
            {
                name: "Troll's Tomb",
                respawn_type: "range",
                respawn_min_seconds: 1800,
                respawn_max_seconds: 3600
            }
        ]
    });
});


router.get('/:id', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved map',   
        data: {
            id: req.params.id
        }
    });
});

module.exports = router;