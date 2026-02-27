const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved bosses',   
    });
});

// kill a boss
router.get('/:id/kill', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved bosses',   
    });
});

// revive a boss
router.get('/:id/revive', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved bosses',   
    });
});

// get boss kill history
router.get('/:id/kills', (req, res) => {
    res.status(200).json({ 
        message: 'Successfully retrieved bosses',   
    });
});


module.exports = router;