//import {Tabulator, FormatModule, EditModule} from 'tabulator-tables';
//import { Tabulator } from './tabulator-tables';
/**
 * Load data from CSV file asynchronously and render bar chart
 */

var require = function(src, success, failure){
  !function(source, success_cb, failure_cb){
          var script = document.createElement('script');
          script.async = true; script.type = 'text/javascript'; script.src = source;
          script.onload = success_cb || function(e){};
          script.onerror = failure_cb || function(e){};
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
  }(src, success, failure);
}



const dispatcher = d3.dispatch('filterCategories', 'filterPlanets');



//let dual_barchart;
let starDict = {}
let starData = [];
let planetDict = {};
let planetData = [];
let starTypeDict = {
  A:0,
  F: 0,
  G: 0,
  K: 0,
  M:0, 
  Unknown: 0
}

let starTypeData = [];
let discoveryDict = {};
let discoveryData = [];
let habitableDict = {
  A: {habitable: 0, unhabitable:0},
  F: {habitable: 0, unhabitable:0},
  G: {habitable: 0, unhabitable:0},
  K: {habitable: 0, unhabitable:0},
  M:{habitable: 0, unhabitable:0}, 
}

let habitableData = [];

dateData = []
dateDict = {}
let datum;
function dictToData(dict)
{
  tempData = [];
  Object.keys(dict).forEach(function (key) {
    let obj = Object();
    obj.x = key;
    obj.y = dict[key];
    tempData.push(obj)
    // do something with obj
  });

  return tempData;
}

function reformatStarData(dataf)
{

  tempData = [];
  tempDict = {};

  dataf.forEach(d=>{
    if (tempDict[d.sy_snum] ==undefined)
    {
      tempDict[d.sy_snum] = 1
    }
    else
    {
      tempDict[d.sy_snum] += 1
    }
  });

  return dictToData(tempDict);



}
function reformatPlanetData(dataf)
{
  tempData = [];
  tempDict = {};
  dataf.forEach(d=>{
    if(tempDict[d.sy_pnum] == undefined){
      tempDict[d.sy_pnum] = 1;
    }
    else {
      tempDict[d.sy_pnum] += 1; 
    }
  });

  return dictToData(tempDict);
}

function reformatDiscoveryData(dataf)
{
  tempData = [];
  tempDict = {};
  dataf.forEach(d=>{
    if(tempDict[d.discoverymethod] == undefined){
      tempDict[d.discoverymethod] = 1;
    }
    else {
      tempDict[d.discoverymethod] += 1; 
    }
  });

  return dictToData(tempDict);
}


function reformatDateData(dataf)
{
  tempData = [];
  tempDict = {};
  dataf.forEach(d=>{
    d.disc_year = +d.disc_year;
    if(tempDict[+d.disc_year] == undefined){
      tempDict[+d.disc_year] = 1;
    }
    else {
      tempDict[+d.disc_year] += 1; 
    }
  });

 

  Object.keys(tempDict).forEach(function (key) {
    let obj = Object();
    obj.x = parseFloat(key);
    obj.y = dateDict[key];
    tempData.push(obj)
    // do something with obj
  });
  console.log("NEW date data")
  console.log(tempData)
  return tempData;
}

function reformatStarTypeData(dataf)
{
  let tempStarDict = {
    A:0,
    F: 0,
    G: 0,
    K: 0,
    M:0, 
    Unknown: 0
  }

  let tempHabitableDict = {
    A: {habitable: 0, unhabitable:0},
    F: {habitable: 0, unhabitable:0},
    G: {habitable: 0, unhabitable:0},
    K: {habitable: 0, unhabitable:0},
    M:{habitable: 0, unhabitable:0}, 
  }


  tempStarData = [];
  tempHabitableData = [];

  dataf.forEach(d=> {
    if(d.st_spectype.length ==0) {tempStarDict.Unknown+=1;}
      else if(d.st_spectype.indexOf('A')>-1)
      {
        tempStarDict.A+=1;

        if(d.pl_orbsmax>8.5 && d.pl_orbsmax < 12.5 )
        {
          tempHabitableDict.A.habitable+=1;
        }
        else
        {
          tempHabitableDict.A.unhabitable +=1
        }

      }
      else if(d.st_spectype.indexOf('F')>-1)
      {
        tempStarDict.F+=1;
        

        if(d.pl_orbsmax>1.5 && d.pl_orbsmax < 2.2 )
        {
          tempHabitableDict.F.habitable+=1;
        }
        else
        {
          tempHabitableDict.F.unhabitable +=1
        }
      }
      else if(d.st_spectype.indexOf('G')>-1)
      {
        tempStarDict.G+=1;

        if(d.pl_orbsmax>.95 && d.pl_orbsmax < 1.4 )
        {
          tempHabitableDict.G.habitable+=1;
        }
        else
        {
          tempHabitableDict.G.unhabitable +=1
        }
      }
      else if(d.st_spectype.indexOf('K')>-1)
      {
        tempStarDict.K+=1;

        if(d.pl_orbsmax>.38 && d.pl_orbsmax < .56 )
        {
          tempHabitableDict.K.habitable+=1;
        }
        else
        {
          tempHabitableDict.K.unhabitable +=1
        }
      }

      else if(d.st_spectype.indexOf('M')>-1)
      {
        tempStarDict.M+=1;
        
        if(d.pl_orbsmax>.08 && d.pl_orbsmax < .12)
        {
          tempHabitableDict.M.habitable+=1;
        }
        else
        {
          tempHabitableDict.M.unhabitable +=1
        }
  }});

  tempStarData = dictToData(tempStarDict);
  //tempHabitableData = dictToData(tempHabitableDict);


  Object.keys(tempHabitableDict).forEach(function (key) {
    let obj = Object();
    obj.group = key;
    obj.habitable = tempHabitableDict[key].habitable;
    obj.unhabitable = tempHabitableDict[key].unhabitable;
    tempHabitableData.push(obj)
    // do something with obj
  });
  tempHabitableData.columns = ["group", "habitable", "unhabitable"]

  return [tempStarData, tempHabitableData]
  
}




d3.csv('data/exoplanets-1.csv')
  .then(data => {
    data.forEach(d => {
      //d.population = +d.population;

      //Chart1 data Fromatting
      if (starDict[d.sy_snum] ==undefined)
      {
        starDict[d.sy_snum] = 1
      }
      else
      {
        starDict[d.sy_snum] += 1
      }

      
      //Chart2 data formatting
      if(planetDict[d.sy_pnum] == undefined){
        planetDict[d.sy_pnum] = 1;
      }
      else {
        planetDict[d.sy_pnum] += 1; 
      }

    //Chart 4 formatting
    if(discoveryDict[d.discoverymethod]==undefined){
        discoveryDict[d.discoverymethod] =1;
      } 
      else {
        discoveryDict[d.discoverymethod]= discoveryDict[d.discoverymethod]+ 1;
      }


      //Chart3  and 5 formatting 
      if(d.st_spectype.length ==0) {starTypeDict.Unknown+=1;}
      else if(d.st_spectype.indexOf('A')>-1)
      {
        starTypeDict.A+=1;

        if(d.pl_orbsmax>8.5 && d.pl_orbsmax < 12.5 )
        {
          habitableDict.A.habitable+=1;
        }
        else
        {
          habitableDict.A.unhabitable +=1
        }

      }
      else if(d.st_spectype.indexOf('F')>-1)
      {
        starTypeDict.F+=1;
        

        if(d.pl_orbsmax>1.5 && d.pl_orbsmax < 2.2 )
        {
          habitableDict.F.habitable+=1;
        }
        else
        {
          habitableDict.F.unhabitable +=1
        }
      }
      else if(d.st_spectype.indexOf('G')>-1)
      {
        starTypeDict.G+=1;

        if(d.pl_orbsmax>.95 && d.pl_orbsmax < 1.4 )
        {
          habitableDict.G.habitable+=1;
        }
        else
        {
          habitableDict.G.unhabitable +=1
        }
      }
      else if(d.st_spectype.indexOf('K')>-1)
      {
        starTypeDict.K+=1;

        if(d.pl_orbsmax>.38 && d.pl_orbsmax < .56 )
        {
          habitableDict.K.habitable+=1;
        }
        else
        {
          habitableDict.K.unhabitable +=1
        }
      }

      else if(d.st_spectype.indexOf('M')>-1)
      {
        starTypeDict.M+=1;
        
        if(d.pl_orbsmax>.08 && d.pl_orbsmax < .12)
        {
          habitableDict.M.habitable+=1;
        }
        else
        {
          habitableDict.M.unhabitable +=1
        }
      }


      d.sy_dist = +d.sy_dist;

  
      //starData.y = Object.entries(starDict)

      d.pl_mass = +d.pl_bmasse;
      d.radius = +d.pl_rade;


//Line chart formatting
d.disc_year = +d.disc_year;

if(+d.disc_year != 0)
{
  if(dateDict[+d.disc_year]==undefined)
  {
    dateDict[+d.disc_year] = 1;
  }
  else { dateDict[+d.disc_year] +=1;}
}

d.solar_system = d.solar_system;
 
d.pl_name = d.pl_name;

    });

 
    
    starData = dictToData(starDict);
    planetData = dictToData(planetDict);
    starTypeData = dictToData(starTypeDict);
    discoveryData = dictToData(discoveryDict);
    /*
    Object.keys(starDict).forEach(function (key) {
      let obj = Object();
      obj.x = key;
      obj.y = starDict[key];
      starData.push(obj)
      // do something with obj
    });


 */


    Object.keys(habitableDict).forEach(function (key) {
      let obj = Object();
      obj.group = key;
      obj.habitable = habitableDict[key].habitable;
      obj.unhabitable = habitableDict[key].unhabitable;
      habitableData.push(obj)
      // do something with obj
    });

    Object.keys(dateDict).forEach(function (key) {
      let obj = Object();
      obj.x = parseFloat(key);
      obj.y = dateDict[key];
      dateData.push(obj)
      // do something with obj
    });
    habitableData.columns = ["group", "habitable", "unhabitable"]


    // Sort data by population
    //data.sort((a,b) => b.population - a.population);
    
    // Initialize chart and then show it
    starChart = new Barchart({ parentElement: '#chart'}, starData, 2, 0, _dispatcher = dispatcher, _chart_num = 0, _x_lable="Number of stars in exoplanet system");
    starChart.updateVis();
    planetChart = new Barchart({ parentElement: '#planetchart'}, planetData,2,0, _dispatcher=dispatcher,_chart_num=1, _x_lable= "Number of planets in exoplanet system");
    planetChart.updateVis();
    starTypeChart = new Barchart({ parentElement: '#startypechart'}, starTypeData,2,0,_dispatcher=dispatcher, _chart_num = 2, _x_lable = "Star type of exoplanet's orbit star. ");
    starTypeChart.updateVis();
    discoveryChart = new Barchart({ parentElement: '#discoverychart'}, discoveryData, 1, _rotate_xaxis = true, _dispatcher=dispatcher, _chart_num=2, _x_lable= "Method of discovery", _padding= 130);
    discoveryChart.updateVis();
    habitableChart = new dual_barchart({ parentElement: '#habitablechart'}, habitableData, 'x axis', 'y axis');
    habitableChart.updateVis();
    distanceChart = new Histogram({ parentElement: '#distancechart'}, data);
    distanceChart.updateVis();
    scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
    scatterplot.updateVis();
    lineChart = new LineChart({ parentElement: '#linechart'}, dateData);
    lineChart.updateVis();
    table = new Table( data)
    table.initVis();
    
    datum = data;
  
    console.log("jhhgkjg")
    console.log(datum);
  })
  .catch(error => console.error(error));





//var parseDate = d3.time.format("%d-%b-%y").parse;
// Get the data
d3.csv("data/exoplanets-1.csv").then(data=> {
  data = data;
data.forEach(function(d) {
    d.name = d.pl_name;
    d.disc_year = +d.disc_year;
    d.disc_method = d.discoverymethod;
});












// Render the table
});




/**
 * Event listener: change ordering
 */
/*
var changeSortingOrder = d3.select("#change-sorting").on("click", function() {
    reverse = !reverse;
    updateVisualization();
});
*/

d3.select('#sortStars').on('click', d => {
  starChart.config.reverseOrder = true;
  starChart.updateVis();
})
d3.select('#sortPlanets').on('click', d => {
  planetChart.config.reverseOrder = true;
  planetChart.updateVis();
})
d3.select('#sortStarTypes').on('click', d => {
  starTypeChart.config.reverseOrder = true;
  starTypeChart.updateVis();
  
})

d3.select('#sortDiscovery').on('click', d => {
  discoveryChart.config.reverseOrder = true;
  discoveryChart.updateVis();
  
})
d3.select('#sortHabitable').on('click', d => {
  habitableChart.config.reverseOrder = true;
  habitableChart.updateVis();
  
})

d3.select('#sortDistance').on('click', d => {
  distanceChart.config.reverseOrder = true;
  discoveryChart.updateVis();

})

dispatcher.on('filterPlanets', function(selectedCategories){
 
 console.log(selectedCategories)
  if (selectedCategories.length == 0) {
    scatterplot.data = datum; planetChart.data = planetData;  starTypeChart.data = starTypeData;
    discoveryChart.data = discoveryData; habitableChart.data = habitableData; lineChart.data = datum;
  table.data = datum;}
     else {
      table.data = datum.filter(d => selectedCategories.includes(d.sy_pnum));

    starChart.data = reformatStarData(datum.filter(d=>selectedCategories.includes(d.sy_pnum)));
    scatterplot.data = datum.filter(d => selectedCategories.includes(d.sy_pnum));
    //planetChart.data = reformatPlanetData(datum.filter(d=> selectedCategories.includes(d.sy_pnum)));
    //starTypeChart.data = reformatStarTypeData.(datum.filter(d=> selectedCategories.includes(d.x)));
    starTypeChart.data = reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_pnum)))[0];
    discoveryChart.data =  reformatDiscoveryData(datum.filter(d=> selectedCategories.includes(d.sy_pnum)));
    //habitableChart.data = reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_snum)))[1];
    lineChart.data = reformatDateData(datum.filter(d => selectedCategories.includes(d.sy_snum)));
      console.log("revised habitable data")
      console.log(reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_snum)))[1])
  }


  scatterplot.updateVis();
  planetChart.updateVis();
  starTypeChart.updateVis();
  discoveryChart.updateVis();
  lineChart.initVis();
  table.initVis();
  starChart.updateVis();
});



dispatcher.on('filterCategories', function(selectedCategories) {

  
    if (selectedCategories.length == 0) {
      scatterplot.data = datum; planetChart.data = planetData;  starTypeChart.data = starTypeData;
      discoveryChart.data = discoveryData; habitableChart.data = habitableData; lineChart.data = datum;
      table.data = datum;}
       else {

      table.data = datum.filter(d => selectedCategories.includes(d.sy_snum));

      scatterplot.data = datum.filter(d => selectedCategories.includes(d.sy_snum));
      planetChart.data = reformatPlanetData(datum.filter(d=> selectedCategories.includes(d.sy_snum)));
      starTypeChart.data = reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_snum)))[0];
      discoveryChart.data =  reformatDiscoveryData(datum.filter(d=> selectedCategories.includes(d.sy_snum)));
      //habitableChart.data = reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_snum)))[1];
      lineChart.data = reformatDateData(datum.filter(d => selectedCategories.includes(d.sy_snum)));
        console.log("revised habitable data")
        console.log(reformatStarTypeData(datum.filter(d=> selectedCategories.includes(d.sy_snum)))[1])
    }
  
  

 
  scatterplot.updateVis();
  planetChart.updateVis();
  starTypeChart.updateVis();
  discoveryChart.updateVis();
  lineChart.initVis();
  table.initVis();
  //habitableChart.update();
  //habitableChart.updateVis();
});



var tabledata = [
  {id:1, name:"Oli Bob", age:"12", col:"red", dob:""},
  {id:2, name:"Mary May", age:"1", col:"blue", dob:"14/05/1982"},
  {id:3, name:"Christine Lobowski", age:"42", col:"green", dob:"22/05/1982"},
  {id:4, name:"Brendon Philips", age:"125", col:"orange", dob:"01/08/1980"},
  {id:5, name:"Margret Marmajuke", age:"16", col:"yellow", dob:"31/01/1999"},
];

console.log(this.datum)
//create Tabulator on DOM element with id "example-table"
var table = new Tabulator("#example-table", {
  height:205, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
  data: datum,
 // progressiveLoad:"load", //assign data to table
  width:500, //fit columns to width of table (optional)
  
});
//table.setData("/data/exoplanets-1.csv");

//trigger an alert message when the row is clicked
table.on("rowClick", function(e, row){ 
 alert("Row " + row.getData().id + " Clicked!!!!");
});