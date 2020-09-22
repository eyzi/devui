import uuid from 'uuid/v4'

const state = {
	apps: []
}

const getters = {
	apps: state => state.apps,
	app: (state, id) => state.apps.find(app => app.id === id)
}

const actions = {
	addApp({commit}, name) {
		commit("ADD_APP", {id:uuid(),name})
	},
	removeApp({commit}, id) {
		commit("REMOVE_APP", id)
	}
}

const mutations = {
	ADD_APP(state, app) {
		state.apps.push(app)
	},
	REMOVE_APP(state, id) {
		state.apps = state.apps.filter(app => app.id !== id)
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}