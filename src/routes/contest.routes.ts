import { Router } from 'express';
import { createContest, editContest } from '../controllers/contest.controller';
import multer from 'multer';
import protect from '../middlewares/auth'

const router = Router()
//multer setup for uploads
const upload = multer({
    storage: multer.memoryStorage(),
  });

router.post('/create-contest', protect, upload.fields([{ name: 'image' }, { name: 'video' }]), createContest);
router.put('/edit-contest/:contestId', protect, upload.fields([{ name: 'image' }, { name: 'video' }]), editContest);

export default router;