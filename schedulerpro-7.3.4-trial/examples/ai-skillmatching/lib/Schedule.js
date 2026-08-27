import '../../../lib/Scheduler/feature/LockRows.js';
import '../../../lib/Scheduler/feature/AI.js';
import MainSchedule from './MainSchedule.js';
import { ai } from './AI.js';

export default class Schedule extends MainSchedule {
    static $name = 'Schedule';

    static configurable = {
        features : {
            ai
        }
    };
}
