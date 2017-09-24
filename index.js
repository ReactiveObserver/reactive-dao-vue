
let prefix = "$reactiveDaoPath_"

const ReactiveDaoVue = {
  install(Vue, options) {
    if(!options || !options.dao) throw new Error("dao option required")
    let dao = options.dao
    Vue.mixin({
      beforeCreate() {
        const optionData = this.$options.data
        if (!this.$options.computed) this.$options.computed = {}
        for(let key in this.$options.reactive) {
          let path = this.$options.reactive[key]
          if(typeof path == 'function'){
            this.$options.computed[prefix + key] = path
          } else if(path instanceof Array) {
          } else if(typeof path == 'string') {
          } else throw new Error("unknown reactive path "+path)
        }
        this.$options.data = function vueReavtiveDaoInjectedDataFn () {
          const data = (
              (typeof optionData === 'function')
                ? optionData.call(this)
                : optionData
            ) || {}
          for (let key in this.$options.reactive) {
            data[key] = null
          }
          return data
        }
      },
      created() {
        this.reactiveObservables = {}
        let reactiveObservables = this.reactiveObservables
        for(let key in this.$options.reactive) {
          let path = this.$options.reactive[key]
          if(typeof path == 'function'){
            reactiveObservables[key] = dao.observable(this[prefix + key])
            this.$watch(prefix + key, newPath => {
              reactiveObservables[key].unbindProperty(this, key)
              reactiveObservables[key] = dao.observable(newPath)
              reactiveObservables[key].bindProperty(this, key)
            })
          } else if(path instanceof Array) {
            reactiveObservables[key] = dao.observable(path)
          } else if(typeof path == 'string') {
            reactiveObservables[key] = dao.observable(path)
          } else throw new Error("unknown reactive path "+path)
          reactiveObservables[key].bindProperty(this, key)
        }
      },
      beforeDestroy() {
        let reactiveObservables = this.reactiveObservables
        for(let key in reactiveObservables) {
          reactiveObservables[key].unbindProperty(this, key)
        }
      }
    })
  }
}


export default ReactiveDaoVue
