<template>
	<div class="main" @click="browse">
		<div class="dir-label">{{ label || `Select ${ isFolder ? 'Folder' : 'File' }` }}</div>
		<div class="dir-box">
			<div class="dir-block">{{ dir || "&lt;Empty&gt;" }}</div>
			<div v-if="dir" class="dir-actions">
				<button @click.stop="open" title="Open">📂</button>
				<button @click.stop="clear" title="Clear">❌</button>
			</div>
		</div>		
	</div>
</template>

<script>
export default {
	props: [
		'dir',
		'isFolder',
		'selectTitle',
		'label'
	],
	methods: {
		browse() {
			let options = {
				title: this.selectTitle,
				isFolder: this.isFolder
			}
			let dir = window.ipcRenderer.sendSync('openDialog', options);
			if (dir) {
				this.$emit('select', dir)
			}
		},
		clear() {
			this.$emit('clear')
		},
		open() {
			window.ipcRenderer.send('openDirectory', {
				dir: this.dir,
				isFolder: this.isFolder
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	padding: 0.3em 0.7em;
	border-radius: 0.3em;
	cursor: pointer;
	color: white;
	background-color: rgb(175, 83, 175) !important;
	transition: background-color .2s;

	&:hover {
		background-color: rgb(160, 57, 160) !important;
	}
}
.dir-label {
	font-size: 0.7em;
	margin: 0 3em;
}
.dir-box {
	display: flex;
	flex-direction: row;

	.dir-block {
		margin: 0.3em;
		font-size: 1.1em;
		flex: 1;
		font-family: monospace;
	}

	.dir-actions {
		text-align: right;
		width: 6em;
		button {
			cursor: pointer;
			margin: 0.3em;
			padding: 0.2em;
			border: none;
			border-radius: 0.3em;
			background: white;

			&:hover,
			&:active,
			&:focus {
				background: rgb(221, 221, 221);
				outline: none;
			}
		}
	}
}
</style>