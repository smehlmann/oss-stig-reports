import * as redux from 'redux';

const initialState = { auth: undefined };

function  authReducer(state = initialState, action) {

    if (action.type === 'refresh') {
        return {
            auth: action.auth,
        };
    }

    return state;
};

const store = redux.createStore(authReducer);


export function getAuth(){
    return store.getState().auth;
}

export default store;