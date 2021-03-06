module.exports = {
	pluginOptions: {
	  electronBuilder: {
		preload: 'src/preload.js',
		customFileProtocol: './',
		builderOptions: {
		  appId: 'com.eyzi.devui',
		  win: {
			icon: 'public/favicon.ico',
			extraResources: [
			  "public/sdk/**"
			]
		  }
		}
	  }
	},
	configureWebpack: {
		devServer: {
		  watchOptions: {
			ignored: ["/node_modules", "/public"],
		  }
		}
	  }
  }