import express from 'express';
import { 
  getOwnerInvoices, 
  getTenantInvoices, 
  payInvoice, 
  remindInvoice, 
  runCron,
  getAdminInvoiceStats,
  adminRemindAll
} from '../controllers/invoiceController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/owner').get(protect, getOwnerInvoices);
router.route('/tenant').get(protect, getTenantInvoices);
router.route('/admin/stats').get(protect, admin, getAdminInvoiceStats);
router.route('/admin/remind-all').post(protect, admin, adminRemindAll);
router.route('/:id/pay').post(protect, payInvoice);
router.route('/:id/remind').post(protect, remindInvoice);
router.route('/run-cron').post(protect, runCron);

export default router;
