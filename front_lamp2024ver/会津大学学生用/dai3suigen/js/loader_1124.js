console.log("loader");
var LOADER = LOADER || {};
console.log("loader");
var results = [];
var doneCount = 0;
LOADER={
	downloadJson:function(sid,datelist){
		//datelistに複数入っている読み出したい日付のデータをforを回してajaxしている
		//
		for(var i = 0 ; i < datelist.length ; i++){
			var count = i;
			(function(i){
					$.ajax({
	            //url:"http://localhost:8080/ellighttracker2?mode=j&date="+date+"&sid="+sid,
	            url:"http://ellighttracker2.appspot.com/ellighttracker2?mode=j&date="+datelist[i]+"&sid="+sid,
	            dataType:'json',
	             error:function () {
	                 alert("error:" +date +".json does not exist.");
	             },
	            //success:LOADER.drawGraph(datelist[i],i)
							success: function(responce){
								results.push(responce);
								doneCount++;
								console.log(results);
								if(doneCount == datelist.length){
									LOADER.drawGraph2(datelist);
								}
							}
					})
			})(count);
		}
	},
	drawGraph:function (date,date_range) {
        return function(json,status){
            var cdate = moment(date,"YYYY-MM-DD").tz("Asia/Tokyo");
						//add
						//var cdate2 = moment(date2,"YYYY-MM-DD").tz("Asia/Tokyo")

            if(document.getElementById("region")==null){
							console.log(json);

                GRAPH.drawGraphReagion(cdate.toDate());
								//add
								//GRAPH.drawGraphReagion(cdate2.toDate());

                for(var i=0;i<json.data_lists.length;i++){
                    //for(var i=0;i<1;i++){
                    GRAPH.drawLineGraph(json.data_lists[i],cdate.toDate(),i);
										//add
										//GRAPH.drawLineGraph(json.data_lists[i],cdate2.toDate(),i);

                }
            }else{
							console.log(json);

                for(var i=0;i<json.data_lists.length;i++){
                    GRAPH.updateLineGraph(json.data_lists[i],cdate.toDate(),i);
										//add
										//GRAPH.updateLineGraph(json.data_lists[i],cdate2.toDate(),i);
                }
            }
        }
	},
	//複数のグラフを描画するための関数。新しく作ったdrawgraphを元にグラフを上書きしている。
	drawGraph2:function (date) {
						var cdate = moment(date,"YYYY-MM-DD").tz("Asia/Tokyo");
						//add
						//var cdate2 = moment(date2,"YYYY-MM-DD").tz("Asia/Tokyo")
						console.log(document.getElementById("region"))
						if(document.getElementById("region")==null){
								console.log(results);

								GRAPH.drawGraphReagion(cdate.toDate());
								//add
								//GRAPH.drawGraphReagion(cdate2.toDate());

								// for(var i=0;i<results.length;i++){
								// 		//for(var i=0;i<1;i++){
								// 		for(var j=0;j<results[i].data_lists.length;j++){
								// 		GRAPH.drawLineGraph(results[i].data_lists[j],cdate.toDate(),j);
								// 		//add
								// 		//GRAPH.drawLineGraph(json.data_lists[i],cdate2.toDate(),i);
								// 	}
								// }
								for(var i=0;i<json.data_lists.length;i++){
                    //for(var i=0;i<1;i++){
                    GRAPH.drawLineGraph(json.data_lists[i],cdate.toDate(),i);
                }
						}else{
								console.log(json);
								for(var i=0;i<results.data_lists.length;i++){
										GRAPH.updateLineGraph(results.data_lists[i],cdate.toDate(),i);
										//add
										//GRAPH.updateLineGraph(json.data_lists[i],cdate2.toDate(),i);
								}
						}
			},
    downloadXml:function(sid,date){
        $.ajax({
            url:"http://ellighttracker2.appspot.com/ellighttracker2?mode=s&date="+date+"&sid="+sid,
           // url:"http://localhost:8080/ellighttracker2?mode=s&date="+date+"&sid="+sid,
//            url:"./"+date+".xml",
            type:'get',
            dataType:'xml',
            crossDomain:true,
             error:function () {
                 alert("error:"+date+".xml does not exist.");
             },
            success:LOADER.parseXml

            });
    },
    parseXml:function(xml,status){
        console.log(status);
        var date=app.date;
        var data1_list= [];
        var data2_list= [];
        var waterLevelList =[];
        var preData=0;
        var preData2=0;
        if(status!=='success'){return;}
        $(xml).find('result').each(function(){
                $(this).find('data').each(function(){
                        if($(this).attr('Time')!=='null'){
                            data1_list.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data1')
                            });
                            data2_list.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data2')
                            });
                            waterLevelList.push({
                                    Time:moment(date+" "+$(this).attr('Time'),"YYYY-MM-DD HH:mm:ss").toDate(),
                                    data:$(this).attr('Data3')
                            });

                        }else{
                            console.log("no attribute \"Time\" ")
                        }
                });
        });
        //console.log(data1_list[0]);
    var startTime=data1_list[0].Time;
        for (var i in data1_list) {
            console.log(data1_list[i].data);
            if (preData==0.0&&Number(data1_list[i].data)>0) {
                store.countCycle++;
                startTime=moment(data1_list[i].Time);
            }
            if(preData>0&&Number(data1_list[i].data==0)){
                store.sum1+=Math.abs(startTime.diff(data1_list[i].Time,'minutes'));
            }
            preData=Number(data1_list[i].data);
        }
        var startTime2=data2_list[i].Time;
        for (var i in data2_list) {
            console.log(data2_list[i].data);
            if (preData2==0.0&&Number(data2_list[i].data)>0) {
                store.countCycle2++;
                startTime2=moment(data2_list[i].Time);
            }
            if(preData2>0&&Number(data2_list[i].data)==0.0){
                store.sum2+=Math.abs(startTime2.diff(data2_list[i].Time,'minutes'));
            }
            preData2=Number(data2_list[i].data);
        }
        console.log(waterLevelList);
                var timezone = "Asia/Tokyo";
                var cdate = moment(date).tz(timezone)
                store.elec1=data1_list[data1_list.length-1].data
                store.elec2=data2_list[data2_list.length-1].data
                if(document.getElementById("region")==null){
                    GRAPH.drawGraphReagion(cdate.toDate());
                    GRAPH.drawLineGraph(data1_list,cdate.toDate(),0);
                    GRAPH.drawLineGraph(data2_list,cdate.toDate(),1);
                }else{
                    GRAPH.updateLineGraph(data1_list,cdate.toDate(),0);
                    GRAPH.updateLineGraph(data2_list,cdate.toDate(),1);
                }
     //           makeChart(data1_list,data2_list,waterLevelList,cdate.toDate());
    },
}
