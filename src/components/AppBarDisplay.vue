<template>
	<div class="main" @click="gotoAppPage">
		<span>{{ app.name || "&lt;Unnamed&gt;" }}</span>
	</div>
</template>

<script>
export default {
	props: ['app'],
	methods: {
		gotoAppPage() {
			this.$router.push({ path: `/app/${this.app.id}` })
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	color: white;
	background-color: rgb(175, 83, 175);
	max-width: 300px;
	margin: 0.5em;
	padding: 0.2em 0.3em;
	text-align: center;
	cursor: pointer;
	user-select: none;
	transition: background-color .2s;

	&:hover {
		background-color: rgb(160, 57, 160);
	}
}
</style>