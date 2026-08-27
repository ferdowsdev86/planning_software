/**
 * Reducers script
 */
import * as AppActions from './app.actions';

const initialState = {
    barMargin : 5
};

export function barMarginReducer(state = initialState, action: AppActions.BarMarginChange) {
    switch (action.type) {

        case AppActions.BAR_MARGIN_CHANGE:
            // console.log('BAR_MARGIN_CHANGE payload=' + action.payload)
            return {
                ...state,
                barMargin : action.payload
            };
        default:
            return state;
    }

}
