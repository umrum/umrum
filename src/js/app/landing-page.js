;(function(window, document, $, undefined) {

  var Project = Project || {};

  /* =============================================================================
    Modules
  ================================================================================ */

  Project.Module = Project.Module || {};

  // TODO


  /* =============================================================================
    Page sections
  ================================================================================ */

  Project.Section = Project.Section || {};


  /*
    Section: Home Charts
  ============================================= */

  Project.Section.HomeCharts = {
    init: function() {
      if ( !$('.page-home').length ) {
        return false;
      }

      $('#chart1').on('inview', function() {
        $(this).off('inview');
        setTimeout(Project.Section.HomeCharts.chart1, 600);
      });

      $('#chart2').on('inview', function() {
        $(this).off('inview');
        setTimeout(Project.Section.HomeCharts.chart2, 600);
      });

      $(window).on('debouncedresize', function() {
        Project.Section.HomeCharts.chart1();
        Project.Section.HomeCharts.chart2();
      });
    },
    chart1: function() {
      var c1 = document.getElementById('chart1');
      var parent = document.getElementById('chart1-parent');
      c1.width = parent.offsetWidth - 40;
      c1.height = parent.offsetHeight - 40;

      var data1 = {
       labels : ['M','T','W','T','F','S','S'],
       datasets : [
         {
           fillColor : 'rgba(255,255,255,.1)',
           strokeColor : 'rgba(255,255,255,1)',
           pointColor : '#b66e5d',
           pointStrokeColor : 'rgba(255,255,255,1)',
           data : [150,200,235,390,290,250,250]
         }
       ]
      };

      var options1 = {
       scaleFontColor : 'rgba(255,255,255,1)',
       scaleLineColor : 'rgba(255,255,255,1)',
       scaleGridLineColor : 'transparent',
       bezierCurve : false,
       scaleOverride : true,
       scaleSteps : 5,
       scaleStepWidth : 100,
       scaleStartValue : 0
      };

      new Chart(c1.getContext('2d')).Line(data1,options1);
    },
    chart2: function() {
      var data = [
        {
          value: 30,
          color: '#F7464A'
        },
        {
          value : 50,
          color : '#E2EAE9'
        },
        {
          value : 100,
          color : '#D4CCC5'
        },
        {
          value : 40,
          color : '#949FB1'
        },
        {
          value : 120,
          color : '#4D5360'
        }

      ];

      //Get the context of the canvas element we want to select
      var ctx = document.getElementById('chart2');
      var parent = document.getElementById('chart2-parent');
      ctx.width = parent.offsetWidth - 40;
      ctx.height = parent.offsetHeight - 40;

      new Chart(ctx.getContext('2d')).Doughnut(data);
    }
  };



/* ==========================================================================
   Initialisation
   ========================================================================== */

  Project.Section.HomeCharts.init();


}(this, this.document, this.jQuery));