import ProjectModel from '../../../../lib/SchedulerPro/model/ProjectModel.js';
import ProjectWebSocketHandlerMixin from './ProjectWebSocketHandlerMixin.js';

export default class WebSocketProjectModel extends ProjectWebSocketHandlerMixin(ProjectModel) {
    static $name = 'WebsocketProjectModel';
}
