<template>
	<div class="main">
		<div>
			<span class="underline-hover" @click="gotoHome">AppList</span>
			<span> &lt; </span>
			<span><UpdatableDisplay :text="app.name" @save="updateAppName" /></span>
		</div>
		<div class="app-info">
			<AppDirectory :appName="app.name" :dir="sandboxAppDir" @change="updateAppDirectory" />
			
			<div style="margin:1em 0.5em;">
				<div><strong>Build Settings</strong></div>
				<div>Itch ID: <input v-model="sandboxApp.itchId" placeholder="eg: user/appname" /></div>
				<div>Discord ID: <input v-model="sandboxApp.discordId" placeholder="eg: 1234567890" /></div>
				<div>Steam ID: <input v-model="sandboxApp.steamId" placeholder="eg: 123456" /></div>
			</div>
		</div>
		<div class="actions">
			<button @click="saveModifiedApp">Save</button>
			<button v-show="!appUnmodified" @click="resetSandbox">Reset</button>
			<button @click="buildApp">Build</button>
			<button @click="deleteApp">Delete</button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
// import { ipcRenderer } from 'electron'
import UpdatableDisplay from '@/components/UpdatableDisplay.vue';
import AppDirectory from '@/components/AppDirectory.vue';
export default {
	components: {
		UpdatableDisplay,
		AppDirectory
	},
	data: ()=>({
		appId: "",
		sandboxApp: {}
	}),
	computed: {
		...mapGetters('apps', {
			getAppById: 'app'
		}),
		sandboxAppDir() {
			return this.sandboxApp.dir ? this.sandboxApp.dir : null
		},
		appUnmodified(){
			let a = this.sandboxApp;
			let b = this.app;

			// Create arrays of property names
			let aProps = Object.getOwnPropertyNames(a);
			let bProps = Object.getOwnPropertyNames(b);

			// If number of properties is different,
			// objects are not equivalent
			if (aProps.length != bProps.length) {
				return false;
			}

			for (var i = 0; i < aProps.length; i++) {
				var propName = aProps[i];

				// If values of same property are not equal,
				// objects are not equivalent

				if (propName !== "__ob__" && a[propName] !== b[propName]) {
					return false;
				}
			}

			// If we made it this far, objects
			// are considered equivalent
			return true;
		},
		app() {
			return this.appId ? this.getAppById(this.appId) : {}
		}
	},
	mounted() {
		if (!this.$route.params.id)
			return this.$router.push({ path: "/" })

		this.appId = this.$route.params.id;		
		this.resetSandbox();
	},
	methods: {
		...mapActions('apps', [
			'updateApp',
			'removeApp'
		]),
		gotoHome() {
			this.$router.push({ path: "/" })
		},
		updateAppName(newName) {
			this.app.name = newName
			this.updateApp(this.app)
		},
		resetSandbox() {
			this.sandboxApp = {...this.app}
		},
		saveModifiedApp() {
			this.updateApp(this.sandboxApp)
		},
		deleteApp() {
			let confirmDelete = window.ipcRenderer.sendSync('confirmDelete', this.app);
			if (confirmDelete) {
				this.removeApp(this.app.id)
				this.gotoHome()
			}
		},
		updateAppDirectory(dir) {
			this.sandboxApp.dir = dir
		},
		buildApp() {
			console.log("### BUILD")
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	padding: 0.2em 0.5em;
}
.underline-hover {
	border-bottom: 1px solid none;
	cursor: pointer;

	&:hover {
		border-bottom: 1px solid rgb(44, 118, 216);
	}
}
.actions > button {
	margin: 0.2em;
}
</style>