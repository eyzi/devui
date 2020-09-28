<template>
	<div class="main">
		<div>
			<input
				class="action-input"
				placeholder="New App"
				v-model="newAppName"
				@keyup.esc.prevent="clearAppName"
				@keyup.enter.prevent="addNewApp"
			/>
		</div>
		<div v-show="newAppName">
			<button class="action-btn" @click="clearAppName">
				<div class="btn-label">Clear</div>
				<div class="btn-shortcut">ESC</div>
			</button>
			<button class="action-btn" @click="addNewApp">
				<div class="btn-label">Add</div>
				<div class="btn-shortcut">ENTER</div>
			</button>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
	data: ()=>({
		newAppName: ""
	}),
	methods: {
		...mapActions('apps', [
			'addApp'
		]),
		addNewApp() {
			if (this.newAppName) {
				this.addApp(this.newAppName)
				this.newAppName = ""
			}
		},
		clearAppName() {
			this.newAppName = ""
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	display: flex;
	margin-top: 1em;

	.action-input {
		border: none;
		margin: 0.2em;
		padding: 0.2em 0.5em;
		border-bottom: 1px solid rgb(224, 224, 224);
	}

	.action-input:active,
	.action-input:focus {
		border-bottom: 1px solid rgb(182, 91, 218);
		outline: none;
	}

	.action-btn {
		border: none;
		background-color: rgb(221, 221, 221);
		margin: 0.2em;
		cursor: pointer;

		&:hover {
			background-color: rgb(185, 185, 185);
		}
	}
}

.btn-shortcut {
	color: rgb(108, 29, 145);
	font-size: 0.7em;
}
</style>