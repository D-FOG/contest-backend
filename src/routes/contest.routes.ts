import { Router } from 'express';
import { createContest, editContest } from '../controllers/contest.controller';
import { scheduleContestNotification, toggleContestLock } from '../controllers/all-contest.controller';
import multer from 'multer';
import protect from '../middlewares/auth';
import { joinContest } from '../controllers/join-contest.controller';


const router = Router()
//multer setup for uploads
const upload = multer({
    storage: multer.memoryStorage(),
  });

router.post('/create-contest', protect, upload.fields([{ name: 'image' }, { name: 'video' }]), createContest);
router.put('/edit-contest/:contestId', protect, upload.fields([{ name: 'image' }, { name: 'video' }]), editContest);
router.post('/toggle-contest/:contestId', protect, toggleContestLock);
router.post('/schedule-notifier/:contestId', protect, scheduleContestNotification);
router.post('/contest/:contestId/join', joinContest);

export default router;