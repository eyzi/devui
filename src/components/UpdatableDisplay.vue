<template>
	<div class="main">
		<div v-if="editing">
			<input
				class="no-border"
				ref="textInput"
				v-model="newText"
				@keyup.esc.prevent="cancel"
				@keyup.enter.prevent="emitSave"
			/>
			<button @click="emitSave">Save</button>
			<button @click="cancel">Cancel</button>
		</div>
		<div v-else>
			<span @click="edit">{{ text }}</span>
		</div>
	</div>
</template>

<script>
export default {
	props: ['text'],
	data: ()=>({
		editing: false,
		newText: ""
	}),
	methods: {
		emitSave() {
			this.$emit("save", this.newText)
			this.editing = false
		},
		cancel() {
			this.newText = this.text
			this.editing = false
		},
		edit() {
			this.newText = this.text
			this.editing = true
			this.$nextTick(() => {
				this.$refs.textInput.focus()
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.main {
	display: inline-block;
}
.no-border {
	border: none;
}
</style>