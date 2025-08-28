// routes/pieceRoutes.js
const express = require('express');
const router = express.Router();
const GarmentPiece = require('../models/GarmentPiece');

// POST /api/pieces/receive
router.post('/receive', async (req, res) => {
  try {
    const newTrunk = new GarmentPiece(req.body);
    const saved = await newTrunk.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/pieces/dispatch/:id
router.post('/dispatch/:id', async (req, res) => {
  try {
    const trunk = await GarmentPiece.findByIdAndUpdate(
      req.params.id,
      {
        isDispatched: true,
        dispatchedDate: new Date(),
      },
      { new: true }
    );
    if (!trunk) return res.status(404).json({ error: 'Trunk not found' });
    res.json(trunk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/pieces
router.get('/', async (req, res) => {
  try {
    const filters = {};

    // dispatched filter
    if (req.query.isDispatched) {
      filters.isDispatched = req.query.isDispatched === 'true';
    }

    // payment status filter
    if (req.query.paymentStatus) {
  if (req.query.paymentStatus === 'completed') {
    filters.$expr = { $eq: ["$paymentAmount", "$expectedPayment"] };
  } else if (req.query.paymentStatus === 'pending') {
    filters.$expr = { $eq: ["$paymentAmount", 0] }; // compare field to value
  } else if (req.query.paymentStatus === 'partial') {
    filters.$expr = { 
      $and: [
        { $gt: ["$paymentAmount", 0] }, 
        { $lt: ["$paymentAmount", "$expectedPayment"] }
      ] 
    };
  }
}


    const trunks = await GarmentPiece.find(filters);
    res.json(trunks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/pieces/:id
router.get('/:id', async (req, res) => {
  try {
    const trunk = await GarmentPiece.findById(req.params.id);
    if (!trunk) return res.status(404).json({ error: 'Trunk not found' });
    res.json(trunk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/pieces/payment/:id
router.put('/payment/:id', async (req, res) => {
  try {
    const { paymentAmount } = req.body;
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    const trunk = await GarmentPiece.findById(req.params.id);
    if (!trunk) return res.status(404).json({ error: 'Trunk not found' });

    // Add new payment record
    trunk.payments.push({ amount: paymentAmount, date: new Date() });

    // Update totalPaid
    trunk.totalPaid += paymentAmount;

    // Mark payment received if fully paid
    trunk.paymentReceived = trunk.totalPaid >= trunk.expectedPayment;

    const updated = await trunk.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/pieces/payment-status/unpaid
router.get('/payment-status/unpaid', async (req, res) => {
  try {
    const unpaid = await GarmentPiece.aggregate([
      {
        $match: {
          isDispatched: true,
          $or: [
            { paymentReceived: false },
            {
              $expr: {
                $lt: ["$paymentAmount", "$expectedPayment"]
              }
            }
          ]
        }
      }
    ]);
    res.json(unpaid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pieces/:id/generate-bill
router.get('/:id/generate-bill', async (req, res) => {
  try {
    const trunk = await GarmentPiece.findById(req.params.id);
    if (!trunk) return res.status(404).json({ error: 'Trunk not found' });

    if (!trunk.paymentReceived) {
      return res.status(400).json({ error: 'Bill can only be generated after full payment is received' });
    }

    // Bill structure
    const bill = {
      vendor: trunk.vendor, // Always "Ramraj Company"
      trunkNumber: trunk.trunkNumber,
      itemType: trunk.itemType,
      quantity: trunk.quantity,
      expectedPayment: trunk.expectedPayment,
      totalPaid: trunk.totalPaid,
      paymentStatus: trunk.paymentReceived ? "Paid in Full" : "Pending",
      payments: trunk.payments,
      generatedDate: new Date()
    };

    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
