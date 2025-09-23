const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const staffController = require('../controllers/staffController');
router.post('/upload', upload.single('image'), uploadImage);
router.post('/', staffController.createStaff);
router.get('/', staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
