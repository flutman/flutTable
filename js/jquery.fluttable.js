//оборачиваем функцию замыканием
;(function($) {
//значения по умолчанию
    var defaults = {
        tblName: "flutTbl",
        tableTitle : "Название таблицы",
        url: "",
        columnName: ["#"],
        containerClass: "fluttable",
        pagination: 0,
        search: false,
        hasTitle: false,
        hasEnumerate: false,
//        optEdit: ["edit","delete"],
        optEdit: [],
        lng: "ru"
    };
    
    var methods = {
        addRow: function(content){
            
        }
    };
    
//    конструктор плагина
    function Fluttable(element,options){
        var widget = this;
        widget.config = $.extend(true,{}, defaults, options);
        widget.element = element;
        
//        просмотр и связка всех событий
        $.each(widget.config, function(key,value){
            if(typeof value === "function"){
                widget.element.on(key+".fluttable", function(e, param){
                    return value(e, widget.element, param);
                });
            }
        })
        
        widget.init();
    }
    
//    прототип
    Fluttable.prototype.init = function(){
        this.element.addClass(this.config.containerClass);
        
        var container = this.element;
        var hasTitle = this.config.hasTitle;
        var optEdit = this.config.optEdit;
        var hasEnumerate = this.config.hasEnumerate;
        
        if (hasTitle) {
            $("<h1/>",{
                text: this.config.tableTitle
            }).appendTo(this.element);
        }
        
        var table = $("<table/>",{
            class: this.config.tblName
        }).appendTo(this.element);

//        CREATE TABLE HEAD
        var thead = $("<thead/>").appendTo(table);
        var tr = $("<tr/>").appendTo(thead);
        var x,y;
//        ENUMERATE
        if (hasEnumerate) $("<th/>",{
            class: "enumerate",
            text: "#"
        }).appendTo(tr);
        
        for (x = 0, y = this.config.columnName.length; x < y; x++) {
            $("<th/>",{
                text: this.config.columnName[x],
            }).appendTo(tr);
        }

//      CREATE TABLE BODY
        var tbody = $("<tbody/>").appendTo(table);
        var intEnum = 0;
        var takeData = $.getJSON(this.config.urlData,function(data){
            $.each(data,function(key,value) {
                tr = $("<tr/>").appendTo(tbody);
                    if (hasEnumerate) $("<td/>",{text: ++intEnum}).appendTo(tr);
                    $.each(value,function(index,txt) {
                        $("<td/>",{
                            "class": index,
                            text: txt
                        }).appendTo(tr);
                    });
            });
        }); 

var widget = this.config;
var pagination = this.config.pagination; 
var search = this.config.search;
        
var divNavOpt = $("<div/>",{
    class: "section_navOpt"
}).appendTo(container);        
//  получаем список полную таблицу
    takeData.complete(function(data){
//      CREATE_PAGINATION
        if (pagination != 0 ) {
//            генерация блока пагинации
            $("<div class='pagination-container'><nav><ul class='pagination'></ul></nav></div>").appendTo(divNavOpt);
            
            var totalRows = table.find("tbody tr").length;
            createPagination(totalRows,table,pagination,$(".pagination"),false);
            
        } //end CREATE_PAGINATION
    });
        
//    CREATE DIVEDIT
        var divOpt = $("<div/>",{
            class: "divOpt"
        }).appendTo(divNavOpt);
        for (x = 0, y = optEdit.length; x < y; x++) {
            switch(optEdit[x]){
                case 'edit':
                    $("<div/>",{
                        html: "<i class='fa fa-times fa-2x'></i>",
                    }).appendTo(divOpt);
                    break;
                case 'delete':
                    $("<div/>",{
                        html: "<i class='fa fa-pencil-square-o fa-2x'></i>",
                    }).appendTo(divOpt);
                    break;
                    
            }
        }
        

//        SEARCH
        if (search){
            var fl_search = $("<input/>",{
                "placeholder":"поиск...",
                "class": "search"
            }).insertBefore(table);
            
            fl_search.on("change",function(){
                if (fl_search.val()) {
                    var str_search = $(fl_search).val().replace(/^\s+|\s+$/g,"");
                    str_search = str_search.replace(/\b\s+\b/g," ");
                    var match = str_search.split(" ");
                    fullMatch(match,table);
//                    pagination create
                    var totalRows = table.find("tbody tr[data-filter]").length;
                    createPagination(totalRows,table,pagination,$(".pagination"),true);
                } else {
                    $("tbody tr").removeAttr("data-filter");
                    clearSearch(table);
                    var totalRows = table.find("tbody tr").length;
                    createPagination(totalRows,table,pagination,$(".pagination"),false);

                }
                
            });    
        } 
//end SEARCH
        
        
//        this.element.trigger("created.flutTable");
    }//конец прототипа
    
    
    $.fn.flutTable = function(options){
        new Fluttable(this.first(),options);
        

        
        
        return this.first(); //возвращаем this чтобы можно было использовать цепочки вызовов. this.first - только первый элемент.
   
    };

    $.fn.addRow = function(data){
        //alert(txtText);
        var tr = $("<tr/>").appendTo(".flutTbl tbody");
        //console.log(data);
        $.each(data,function(key,value){
            $("<td/>",{
                "class": "help",
                text: value
            }).appendTo(tr);
        });    

        return this;
        };
//блок функций  
    
//отчистка поиска
    function clearSearch(tbl){
       tbl.find("tbody tr").each(function(i,elem){
            var tagTD = $(this).find("span.h_light").closest("td");
            tagTD.each(function(i,elem){
            var txtTD = $(this).text();
                
                if ($(this).text() != ""){
                    $(this).html('');
                    $(this).text(txtTD);
                }
            });
       });
    }
    
//PAGINATION
    function createPagination(colRows,tbl,pagRows,pagBlock,filter){
        pagBlock.html("");
        if (filter == undefined) filter = false;
        var trnum = 0;
        var pagSelector = (filter)?"tr[data-filter]":"tr:gt(0)";
//        console.log("pS: " + pagSelector);
        tbl.find(pagSelector).each(function(){
            trnum++;
            if(trnum>pagRows){
//                console.log("trnum: " + trnum);
                $(this).hide();
            }
            if(trnum<=pagRows){
                $(this).show();
            }
        });
        
        if(colRows > pagRows){
            var pagenum = Math.ceil(colRows/pagRows);
            for(var i=1;i<=pagenum;){
                $(pagBlock).append("<li data-page='"+i+"'>\<span>"+ i++ +"</span>\</li>").show();
            }
        }
        
        pagBlock.find("li:first-child").addClass("active");
        pagBlock.find("li").on("click",function(){
            var pageNum = $(this).attr("data-page");
            trIndex = 0;
            pagBlock.find("li").removeClass("active");
            $(this).addClass("active");
            tbl.find(pagSelector).each(function(){
                trIndex++;
                if (trIndex > (pagRows*pageNum) || trIndex <= ((pagRows*pageNum)-pagRows)){
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        });
    }
//    END PAGINATION

//    поиск полного совпадения
    function fullMatch(match,tbl){
        tbl.find("tbody tr").hide();
        tbl.find("tbody tr").removeAttr("data-filter");
//        tbl.find("tbody tr td>span").remove(".h_light");
        
        
        var f_match = new RegExp ("("+match.join("|")+")(?!\">.*)","gi");
        tbl.find("tbody tr").each(function(i,elem){
            
            var tagTD = $(this).find("span.h_light").closest("td");
            tagTD.each(function(i,elem){
            var txtTD = $(this).text();
                
                if ($(this).text() != ""){
                    $(this).html('');
                    $(this).text(txtTD);
                }
            });
            
            var tr = $(this).html();
            var mtch = tr.match(f_match);
            if (f_match !="" && mtch != null && match.length == mtch.length){
                $(this).html(tr.replace(f_match,"<span class='h_light' style='color:red;'>$1</span>"));
                $(this).attr("data-filter","filter");
            } 
        });                
        
    }
    
    

    
}(jQuery));