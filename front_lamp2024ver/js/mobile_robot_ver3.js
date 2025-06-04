$(function(){
  $('#datepicker').datepicker().datepicker('setDate', new Date());
  $('#getdate').click(function(){
    const when = $('#datepicker').val();
    console.log(when);

  });
});

/*      
// date sid
          function loadJson(sid, date) {
            console.log("call json", date);
            $.ajax({
              url: "http://ellighttracker2.appspot.com/ellighttracker2?mode=j&date=" + date + "&sid=" + sid,
              dataType: "json",
              crossDomain: true,
              timeout: 10000,
              success: parse_json
            });
          }

          function parse_json(json, status) {
            //var redCountArray = new Array(45); for(var i=0;i<json.data_lists.length;i++){
            json_data = json;
            console.log(status);
            drawlamps(json_data,json_data.data_lists[0].length -1);
            //Update slider range
            bigValueSlider.noUiSlider.updateOptions({
                start: json_data.data_lists[0].length -1,
                range: {
                    min: 0,
                    max: json_data.data_lists[0].length -1
                }
            });
          }
	  */

// Creating Sliders
var bigValueSlider = document.getElementById('slider-huge');
var rangeNavValues = document.getElementById('huge-value');
noUiSlider.create(bigValueSlider, {
  start: 0,
  step: 1,
  range: {
    min: 0,
    max: 100 //sample size
  },
  pips: {
    density: 5 //Display memory
  }
});
// Call drawlamp to get the value to be changed in real time
bigValueSlider.noUiSlider.on('update', function (values, handle) {
  drawlamps(json_data,Math.floor(values[handle]));
});
