//const { Tabulator } = require("tabulator-tables");

class Table{
    constructor(_data){
        this.data = _data;
    }


    initVis(){
        this.table = new Tabulator('#table', {
            height: 300,
            data: this.data,
            layout: "fitColumns",
            columns: [
                {title: "Planet Name", field: "pl_name", width: 150},
                {title: "Discovery Method", field:"discoverymethod"},
                {title: "Discover Year", field: "disc_year"},
                

            ]
        })
    }
}