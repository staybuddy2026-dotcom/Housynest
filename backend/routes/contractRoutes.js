import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getLawyerContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getBookedTenants,
  getOwnerContracts,
  getTenantContracts,
  markOwnerContractsRead,
  markTenantContractsRead,
  generateContractPdf
} from '../controllers/contractController.js';

const router = express.Router();

router.route('/')
  .post(protect, createContract);

// Lawyer routes
router.get('/lawyer', protect, getLawyerContracts);

// Owner routes
router.get('/owner', protect, getOwnerContracts);
router.put('/owner/mark-read', protect, markOwnerContractsRead);

// Tenant routes
router.get('/tenant', protect, getTenantContracts);
router.put('/tenant/mark-read', protect, markTenantContractsRead);

router.get('/:id/booked-tenants', protect, getBookedTenants);
router.get('/:id/pdf', protect, generateContractPdf);


router.route('/:id')
  .get(protect, getContractById)
  .put(protect, updateContract)
  .patch(protect, updateContract)
  .delete(protect, deleteContract);

export default router;
