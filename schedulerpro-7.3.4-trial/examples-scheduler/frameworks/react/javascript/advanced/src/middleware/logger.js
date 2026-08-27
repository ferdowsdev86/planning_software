/**
 * Logger middleware. You don't need it in production.
 */
const logger = store => {
    return next => {
        return action => {
            // Uncomment to have console logging
            // console.log('[Logger]  Dispatching: ', action);
            const result = next(action);
            // Uncomment to have console logging
            //console.log('[Logger] New state is:', store.getState());
            return result;
        };
    };
};

export default logger;
