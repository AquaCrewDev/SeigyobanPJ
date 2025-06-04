var app = new Vue({
    el:'#app',
    data:{
      date:"",
      sid:"Lab1",
    },
    computed:{
        countCycle:function () {
            return store.countCycle;
        },
        countCycle2:function () {
            return store.countCycle;
        },
        sum1:function () {
            return store.sum1;
        },
        sum2:function () {
            return store.sum2
        },
        elec1:function () {
            return store.elec1;
        },
        elec2:function () {
           return store.sum2
        },
    },
    methods:{
        submit:function(date){
            console.log(this.date);
            //LOADER.downloadXml(this.sid,this.date);
            loadJson(this.sid,this.date);
        }
    }
});

