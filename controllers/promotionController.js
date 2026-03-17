const { Promotion } = require('../models');
const { Op } = require('sequelize');


/* ================= CREATE OFFER ================= */

exports.createOffer = async (req, res) => {

  try {

    const {
      offer_name,
      description,
      offer_type,
      headline,
      discount_value,
      minimum_order_value,
      category,
      applicable_products,
      valid_from,
      valid_to,
      status,
      show_homepage_banner
    } = req.body;

    if (!offer_name || !offer_type) {
      return res.status(400).json({
        success: false,
        message: 'Offer name and type required'
      });
    }

    const offer = await Promotion.create({
      offer_name,
      description,
      offer_type,
      headline,
      discount_value,
      minimum_order_value,
      category,
      applicable_products,
      valid_from,
      valid_to,
      status,
      show_homepage_banner,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer
    });

  } catch (err) {

    console.error('CREATE OFFER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};



/* ================= LIST OFFERS ================= */

exports.listOffers = async (req, res) => {

  try {

    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let where = {};

    if (search) {
      where.offer_name = {
        [Op.like]: `%${search}%`
      };
    }

    if (status !== 'all') {
      where.status = status;
    }

    const { rows, count } = await Promotion.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: rows
    });

  } catch (err) {

    console.error('LIST OFFER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};



/* ================= GET OFFER ================= */

exports.getOffer = async (req, res) => {

  try {

    const offer = await Promotion.findByPk(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.json(offer);

  } catch (err) {

    console.error('GET OFFER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};



/* ================= UPDATE OFFER ================= */

exports.updateOffer = async (req, res) => {

  try {

    const offer = await Promotion.findByPk(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.update(req.body);

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: offer
    });

  } catch (err) {

    console.error('UPDATE OFFER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};



/* ================= DELETE OFFER ================= */

exports.deleteOffer = async (req, res) => {

  try {

    const offer = await Promotion.findByPk(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.destroy();

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });

  } catch (err) {

    console.error('DELETE OFFER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};



/* ================= UPDATE STATUS ================= */

exports.updateOfferStatus = async (req, res) => {

  try {

    const offer = await Promotion.findByPk(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    offer.status = req.body.status;

    await offer.save();

    res.json({
      success: true,
      message: 'Offer status updated',
      data: offer
    });

  } catch (err) {

    console.error('STATUS UPDATE ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });

  }
};