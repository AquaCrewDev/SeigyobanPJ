/**
 * グラフを2日分表示する為の変更を加えた版
 * @author Tsuruno Kota
 */
//Vue.js初期化
store = new Vue({
        data:{
            baseUrl:"http:ellighttracker2.appspot.com/",
            testUrl:"http://localhost:8080/",
            //date:moment().format("YYYY-MM-DD"),
            date:[moment().format("YYYY-MM-DD")],
            countCycle:0,
            countCycle2:0,
            sum1:0,
            sum2:0,
            elec1:0,
            elec2:0,
            sid:1,
            regionId:1,
            form_json1:{},
            form_json2:{}
        },
        methods:{
            graph_request:function (sysid,date) {
                return axios.get(this.baseUrl+'/ellighttracker2?mode=s&date='+date+"&sid="+sysid)
                    .then(function (response) {
                        console.log("SUCCESS:graph_request is downloaded");
                    })
                    .catch(function () {
                        console.log("ERROR:graph_request error");
                    })
                }
            },
            make_form_paper2:function () {
                return axios.get(this.baseUrl+'/month?mode=e&year='+date.year()+"&month="+date.month()+"&regionId="+this.regionId)
                    .then(function (response) {
                        console.log("SUCCESS:MonthData is downloaded");

                    })
                    .catch(function () {
                        console.log("ERROR:make_form_paper1 error");
                    })
            },
            change_regionid:function (rId) {
               this.regionId=rId
            },
            get_data:function(keyName) {
                return this.$data[keyName];
            }

});
var app = new Vue({
    el:'#app',
    data:{
      date:"", //moment().format("YYYY-MM-DD"),
      datelist:[],//リストにして必要な日付を格納
      sid:"DAQA005",
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
        submit:function(event){
            console.log(this.date);
            console.log(this.sid);

            //dateをlistに格納し、表示したい日を複数日をまとめて表示できる
            this.datelist.push(this.date);
            for(let i = 1;i < 2; i++){
              //次の日付をlistに加えていく
              this.datelist.push(moment(this.date,"YYYY-MM-DD").add(i,"d").format("YYYY-MM-DD"));
            }
            console.log(this.datelist);

            //LOADER.downloadXml(this.sid,this.date);
            LOADER.downloadJson(this.sid,this.datelist);
        }
    }
});
