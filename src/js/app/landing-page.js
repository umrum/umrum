;(function(window, document, $) {

  var Project = Project || {};

  /* =============================================================================
    Modules
  ================================================================================ */

  Project.Module = Project.Module || {};


  /*
    Module: Log
  ============================================= */


  /* =============================================================================
    Page sections
  ================================================================================ */

  Project.Section = Project.Section || {};


  /*
    Section: Jumbotron
  ============================================= */

  Project.Section.Jumbotron = {
    particleAnimation: function() {
      var canvas = document.getElementById('canvas-particles');
      var ctx = canvas.getContext('2d');
      var particles = [];
      var particleCount = 40;

      for(var i=0; i<particleCount;i++)
        particles.push(new particle());

      function particle() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 300;
        this.speed = 2 + Math.random() * 3;
        this.radius = Math.random() * 3;
        this.opacity = (Math.random() * 100) / 1000;
      }

      function loop() {
        requestAnimationFrame(loop);
        draw();
      }

      function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.globalCompositeOperation = 'lighter';
        for(var i=0; i<particles.length; i++) {
          var p = particles[i];
          ctx.beginPath();
          ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2, false);
          ctx.fill();
          p.y -= p.speed;
          if(p.y <= -10)
            particles[i] = new particle();
        }
      }

      loop();
    }
  };


  /*
    Section: Home Charts
  ============================================= */

  Project.Section.HomeCharts = {
    init: function() {
      this.chart1();
      this.chart2();

      $(window).on('debouncedresize', function() {
        Project.Section.HomeCharts.chart1();
        Project.Section.HomeCharts.chart2();
      });
    },
    chart1: function() {
      var c1 = document.getElementById("chart1");
      var parent = document.getElementById("chart1-parent");
      c1.width = parent.offsetWidth - 40;
      c1.height = parent.offsetHeight - 40;

      var data1 = {
       labels : ["M","T","W","T","F","S","S"],
       datasets : [
         {
           fillColor : "rgba(255,255,255,.1)",
           strokeColor : "rgba(255,255,255,1)",
           pointColor : "#b66e5d",
           pointStrokeColor : "rgba(255,255,255,1)",
           data : [150,200,235,390,290,250,250]
         }
       ]
      }

      var options1 = {
       scaleFontColor : "rgba(255,255,255,1)",
       scaleLineColor : "rgba(255,255,255,1)",
       scaleGridLineColor : "transparent",
       bezierCurve : false,
       scaleOverride : true,
       scaleSteps : 5,
       scaleStepWidth : 100,
       scaleStartValue : 0
      }

      new Chart(c1.getContext("2d")).Line(data1,options1);
    },
    chart2: function() {
      var data = [
        {
          value: 30,
          color:"#F7464A"
        },
        {
          value : 50,
          color : "#E2EAE9"
        },
        {
          value : 100,
          color : "#D4CCC5"
        },
        {
          value : 40,
          color : "#949FB1"
        },
        {
          value : 120,
          color : "#4D5360"
        }

      ];

      //Get the context of the canvas element we want to select
      var ctx = document.getElementById("chart2");
      var parent = document.getElementById("chart2-parent");
      ctx.width = parent.offsetWidth - 40;
      ctx.height = parent.offsetHeight - 40;

      new Chart(ctx.getContext("2d")).Doughnut(data);
    }
  };



/* ==========================================================================
   Initialisation
   ========================================================================== */

  // Project.Section.Jumbotron.particleAnimation();

  if ( $('.page-home').length ) {
    Project.Section.HomeCharts.init();
  }


}(this, this.document, this.jQuery));