import express from 'express';
import {
  getShiprocketProducts,
  getShiprocketCollections,
  getShiprocketCollectionProducts,
  checkoutToken,
  orderWebhook
} from '../controllers/shiprocketController.js';

const router = express.Router();

router.route('/products').get(getShiprocketProducts);
router.route('/collections').get(getShiprocketCollections);
router.route('/collection-products/:id').get(getShiprocketCollectionProducts);
router.route('/checkout-token').post(checkoutToken);
router.route('/order-webhook').post(orderWebhook);

export default router;
