//Author:2goyoung
//Data:2017/06/09

let vueDialog={}

vueDialog.config={
    className:'vue-dialog',
    themeName:'default-theme',
    animateShowClass:'show-animate',
    animateHideClass:'hide-animate',
    singleMode:true,
    target:'body'
}

vueDialog.install=function(Vue,options){
    if(vueDialog.installed) return;

    let dialog={},animateEndEvent=getAnimateEndEvent()

    dialog.alert=function(content,btnConfig,options){
        if(typeof options=="undefined")
            options={type:'alert'}
        else
            options.type='alert'
        return new Dialog(content,btnConfig,options).open()
    }

    dialog.confirm=function(content,btnConfig,options){
        if(typeof options=="undefined")
            options={type:'confirm'}
        else
            options.type='confirm'

        return new Dialog(content,btnConfig,options).open()
    }

    dialog.success=function(content,btnConfig,options){
        if(typeof options=="undefined")
            options={type:'success'}
        else
            options.type='success'
        return new Dialog(content,btnConfig,options).open()
    }

    dialog.error=function(content,btnConfig,options){
        if(typeof options=="undefined")
            options={type:'error'}
        else
            options.type='error'
        return new Dialog(content,btnConfig,options).open()
    }

    dialog.info=function(content,btnConfig,options){
        if(typeof options=="undefined")
            options={type:'info'}
        else
            options.type='info'
        return new Dialog(content,btnConfig,options).open()
    }

    dialog.config=vueDialog.config

    class Dialog {
        constructor(content,btnConfig,options){
            document.activeElement.blur()
            content =typeof content =="undefined"?'':content
            let dialogEl=document.querySelector(`.${dialog.config.className}`),self=this,switchDialog=false
            if(dialogEl){
                dialogEl.parentNode.removeChild(dialogEl)
                switchDialog=true
            }

            let dialogBtns=[]

            if(getType(btnConfig) =="undefined"){
                dialogBtns.push({text:'确定'})
            }else if(getType(btnConfig)  =="function"){
                dialogBtns.push({text:'确定',click:btnConfig})
            }else if(getType(btnConfig)=="object"){
                dialogBtns.push(btnConfig)
            }else if(getType(btnConfig)=="array"){
                if(getType(btnConfig[0])=="function"){
                    btnConfig.forEach((n)=>{
                        dialogBtns.push({click:n})
                    })
                }else if(getType(btnConfig[0])=="object"){
                    dialogBtns=btnConfig
                }
            }

            let vueCom={
                template:
                    `<div ref="dialogRef" :class="[{'${dialog.config.animateShowClass}':showAction},{'${dialog.config.animateHideClass}':hideAction},{'replace-dialog':switchDialog}]" class="${dialog.config.className} ${options.themeName?options.themeName:dialog.config.themeName} dialog-${options.type}" @touchmove.prevent>
                        <div class="dialog-panel">
                            <div class="dialog-animate">
                                <div class="dialog-outer">
                                    <div class="dialog-inner">
                                        <div class="dialog-content">
                                        ${typeof content!="object"?content:content.template}
                                        </div>
                                        <div class="dialog-btns">
                                            <div class="btn" :class="[btn.className,'btn-'+index]" v-for="(btn,index) in dialogBtns" @click="click(btn.click)">
                                                <span class="btn-text">{{btn.text?btn.text:(index==0?"确认":"取消")}}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`,
                data(){
                    let defaultData={dialogBtns,showAction:false,hideAction:false,switchDialog}
                    return content=="string"?defaultData:Object.assign(defaultData,content.data)
                },
                watch:{

                },
                methods:{
                    click(fun){
                        if(typeof fun =="function"){
                            if(fun.call(this)==false){
                                return
                            }
                        }
                        self.close()
                    }

                }
            }
            if(typeof content =="object"){
                for(var i in content.methods){
                    vueCom.methods[i]=content.methods[i]
                }
                for(var i in content.watch){
                    vueCom.watch[i]=content.watch[i]
                }
            }

            let tpl=Vue.extend(vueCom)
            this.dialogVue=new tpl()
            this.dialogDom=this.dialogVue.$mount().$el

        }
        open(){
            document.querySelector(dialog.config.target).appendChild(this.dialogDom)
            this.dialogVue.$refs.dialogRef.offsetWidth=this.dialogVue.$refs.dialogRef.offsetWidth//强制重绘 防止transitiond动画不执行
            this.dialogVue.showAction=true
            return this
        }
        close(){
            if(animateEndEvent.transition!=''||animateEndEvent.animation!='') {
                this.dialogVue.$refs.dialogRef.addEventListener(animateEndEvent.transition, () => {remove.call(this)})
                this.dialogVue.$refs.dialogRef.addEventListener(animateEndEvent.animation, () => {remove.call(this)})
            }else{
                remove.call(this)
            }
            this.dialogVue.hideAction=true
            function remove(){
                if(this.dialogDom)
                    document.querySelector(dialog.config.target).removeChild(this.dialogDom)
                this.dialogDom=null
                this.dilogVue=null
            }
        }
        setData(data){
            for(var i in data){
                this.dialogVue[i]=data[i]
            }
        }
        getData(name){
            return this.dialogVue[name]
        }
    }

    function getType(value) {

        if (null === value) {
            return 'null';
        }

        let type = typeof value;
        if ('undefined' === type || 'string' === type) {
            return type;
        }

        var typeString = Object.prototype.toString.call(value);
        switch (typeString) {
            case '[object Arguments]':
                return 'arguments';
            case '[object Array]':
                return 'array';
            case '[object Boolean]':
                return 'boolean';
            case '[object Date]':
                return 'date';
            case '[object Error]':
                return 'error';
            case '[object Function]':
                return 'function';
            case '[object JSON]':
                return 'json';
            case '[object Math]':
                return 'math';
            case '[object Number]':
                return 'number';
            case '[object RegExp]':
                return 'regexp';
            case '[object Object]':
                if (undefined !== value.nodeType) {
                    if (3 == value.nodeType) {
                        return (/\S/).test(value.nodeValue) ? 'textnode' : 'whitespace';
                    } else {
                        return 'element';
                    }
                } else {
                    return 'object';
                }
            default:
                return 'unknow';
        }
    }

    function getAnimateEndEvent(){
        let endEvent={transition:'',animation:''},
         el = document.createElement('fakeelement'),
         transitions = {
            'WebkitTransition':'webkitTransitionEnd',
            'transition':'transitionEnd',
            'OTransition':'oTransitionEnd',
            'MozTransition':'transitionEnd'
        },
        animations={
            'animations':'animationend',
            'webkitAnimation':'webkitAnimationEnd',
            'MSAnimation':'MSAnimationEnd'
        }
        for( t in transitions){
            if( el.style[t] !== undefined ){
                endEvent.transition=transitions[t]
                break
            }
        }
        for( a in animations){
            if( el.style[a] !== undefined ){
                endEvent.animation=animations[a]
                break
            }
        }
        return endEvent
    }



    Vue.prototype.$dialog=dialog
    vueDialog.installed=true
}



// 支持 CommonJS
if (typeof exports == "object") {
    module.exports = vueDialog
// 支持 AMD
} else if (typeof define == "function" && define.amd) {
    define([], function(){ return vueDialog })
// Vue 是全局变量时，自动调用 Vue.use()
} else if (window.Vue) {
    window.VueTouch = vueDialog
    Vue.use(vueDialog)
}