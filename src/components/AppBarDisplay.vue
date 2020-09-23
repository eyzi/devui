<template>
	<div class="main" @click="gotoAppPage">
		<span>{{ app.name }}</span>
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
	background-color: rgb(209, 209, 209);
	max-width: 300px;
	margin: 0.5em;
	padding: 0.2em 0.3em;
	text-align: center;
	cursor: pointer;
	user-select: none;

	&:hover {
		background-color: rgb(167, 167, 167);
	}
}
</style>