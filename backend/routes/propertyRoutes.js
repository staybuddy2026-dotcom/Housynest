import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import {
  createProperty,
  getProperties,
  getOwnerProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAdminProperties,
  updatePropertyStatus,
  getPendingPropertyCount,
  getSavedProperties,
  getPopularCities,
  deletePropertyByAdmin,
  getLawyerOwnerProperties,
  getSimilarProperties,
  createReview,
  getPropertyReviews
} from '../controllers/propertyController.js';

const router = express.Router();

router.get('/admin/all', protect, admin, getAdminProperties);
router.get('/admin/pending-count', protect, admin, getPendingPropertyCount);
router.patch('/admin/:id/status', protect, admin, updatePropertyStatus);
router.delete('/admin/:id', protect, admin, deletePropertyByAdmin);

router.get('/popular-cities', getPopularCities);

router.route('/')
  .get(getProperties)
  .post(protect, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'documents', maxCount: 5 }]), createProperty);

router.get('/saved', protect, getSavedProperties);

router.get('/owner', protect, getOwnerProperties);
router.get('/lawyer/owner/:ownerId', protect, getLawyerOwnerProperties);

router.get('/:id/similar', getSimilarProperties);

router.route('/:id/reviews')
  .get(getPropertyReviews)
  .post(protect, createReview);

router.route('/:id')
  .get(getPropertyById)
  .put(protect, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'documents', maxCount: 5 }]), updateProperty)
  .delete(protect, deleteProperty);

export default router;
