import { Router } from 'express';
import { createContest, editContest } from '../controllers/contest.controller';
import multer from 'multer';

const router = Router()
//multer setup for uploads
const upload = multer({
    storage: multer.memoryStorage(),
  });

router.post('/create-contest', upload.fields([{ name: 'image' }, { name: 'video' }]), createContest);
router.post('/create-contest', upload.fields([{ name: 'image' }, { name: 'video' }]), editContest);

module.exports = router