$(function(){
  /*
  $('#output_csv').click(function(){
    $('#download_csv').prop('disabled', false);
    const fromwhen = $('#input_from').val();
    const towhen = $('#input_to').val();
    */
  while(true){
    setTimeout();
    $.ajax({
      type: 'GET',
      url: '../mqtt_sub.php',
      data: {val1: fromwhen, val2: towhen},
      dataType: 'text'
    })
    .done(function(data){
      $('#lamp_color_csv').text(data);
      let csv = $('#lamp_color_csv').val();
      //let bom = new Unit8Array([0xEF, 0xBB, 0xBF]);
      //let blob = new Blob([bom, data], {type: 'text/csv'});
      let blob = new Blob([data], {type: 'text/csv'});
      //let url = (window.URL || window.webkitURL).createObjectURL(blob);
      //let a = document.getElementById('download_csv');
      //a.download = 'lampdata_' + $('#input_from').val() + '_' + $('#input_to').val() + '.csv';
      //a.href = url;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'lampdata_' + fromwhen + '_' + towhen + '.csv';
      link.click();
    })
    .fail(function(XMLHttpRequest, testStatus, errorThrown){
      alert(errorThrown);
    });
  }
  //});
  //$('#download_csv').click(function(){
  //});
});
