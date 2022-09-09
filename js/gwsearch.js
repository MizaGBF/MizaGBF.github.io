var enabled = false;
var SQL = null;
var dbcache = {};

function enable()
{
    enabled = true;
    document.getElementById("gwfilterconfirm").disabled = false;
    let loadingArea = document.getElementsByClassName("loading")[0];
    while(loadingArea.childNodes.length > 0)
        loadingArea.removeChild(loadingArea.childNodes[0]);
}

function disable()
{
    enabled = false;
    document.getElementById("gwfilterconfirm").disabled = true;
    let img = document.createElement("img");
    img.src = "assets/loading.gif";
    let loadingArea = document.getElementsByClassName("loading")[0];
    while(loadingArea.childNodes.length > 0)
        loadingArea.removeChild(loadingArea.childNodes[0]);
    loadingArea.appendChild(img);
}

function load()
{
    get("gw/index.json?" + Date.now(), loadIndex, null, null);
    let config = {
        locateFile: () => "ext/sql-wasm.wasm",
    };
    initSqlJs(config).then(function(s) {SQL = s});
    enable();
}

function loadIndex(args)
{
    let gwlist = JSON.parse(this.response);
    let gwoption1 = document.getElementById('gwoption1');
    for(let id of gwlist)
    {
        gwoption1.innerHTML += '<option value=' + id + '>GW' + id.replace('_', ' ') + '</option>'
    }
}

function get(url, callback, err_callback, args, rtype = null)
{
    var xhr = new XMLHttpRequest();
    xhr.ontimeout = function () {
        if(err_callback != null) err_callback.apply(xhr);
    };
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback.apply(xhr, [args]);
            } else {
                if(err_callback != null) err_callback.apply(xhr, [args]);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.timeout = 180000;
    if(rtype != null) xhr.responseType = rtype;
    xhr.send(null);
}

function search()
{
    disable();
    let gw = document.getElementById("gwoption1").value;
    let type = document.getElementById("gwoption2").value;
    let target = document.getElementById("gwoption3").value;
    let filter = document.getElementById("gwfilter").value.toLowerCase().replace("'", "''").replace("%", "\\%");
    if(filter == "")
    {
        enable();
        return;
    }
    else if(gw in dbcache)
        performSearch(gw, type, target, filter);
    else
        get("gw/" + gw + ".sql", sqlSuccess, null, [gw, type, target, filter], 'arraybuffer');
}

function sqlSuccess(args)
{
    const uInt8Array = new Uint8Array(this.response);
    dbcache[args[0]] = new SQL.Database(uInt8Array);
    performSearch(args[0], args[1], args[2], args[3])
}

function sqlFail(args)
{
    enable();
    document.getElementsByClassName("loading")[0].appendChild(document.createTextNode("Failed to load GW" + args[0] + ".sql"));
}

function resetOutput()
{
    let o = document.getElementsByClassName("gwoutput")[0];
    let p = o.parentNode;
    o.remove();
    
    o = document.createElement('div');
    o.className = "gwoutput";
    o.id = "category";
    p.appendChild(o);
    
    let t = document.createElement('table');
    t.className = "sortable";
    t.id = "result";
    o.appendChild(t);
    
    let th = document.createElement('thead');
    th.id = "table-header";
    t.appendChild(th);
    let tr = document.createElement('tr');
    th.appendChild(tr);
    
    let tb = document.createElement('tbody');
    tb.id = "table-content";
    t.appendChild(tb);
}

function formatHeader(name)
{
    switch(name)
    {
        case "user_id": return "ID";
        case "id": return "ID";
        case "day_1": return "Day 1 & Interlude";
        case "interlude_and_day1": return "Day 1 & Interlude";
        case "day_2": return "Day 2";
        case "day_3": return "Day 3";
        case "day_4": return "Day 4";
        case "day_5": return "Day 5";
        case "total_1": return "Total Day 1";
        case "total_2": return "Total Day 2";
        case "total_3": return "Total Day 3";
        case "total_4": return "Total Day 4";
        case "total_5": return "Total Day 5";
        case "level": return "Rank";
        case "defeat": return "Battles";
        case "rank": return "Top";
        case "ranking": return "Top";
        default: return name.charAt(0).toUpperCase() + name.slice(1);
    }
}

function cellType(column)
{
    return (column.includes("name") || column.includes("day") || column.includes("total") || column.includes("prelim") || column.includes("id")) ? "cell-big" : "cell";
}

function formatCell(column, content, type)
{
    if(content == null)
        return document.createTextNode("n/a");
    switch(column)
    {
        case "user_id":
        case "id":
        {
            let ref = document.createElement('a');
            if(type == 1)
                ref.setAttribute('href', "https://game.granbluefantasy.jp/#guild/detail/" + content);
            else
                ref.setAttribute('href', "https://game.granbluefantasy.jp/#profile/" + content);
            ref.appendChild(document.createTextNode(content));
            return ref;
        }
        case "preliminaries":
        case "interlude":
        case "day_1":
        case "interlude_and_day1":
        case "day_2":
        case "day_3":
        case "day_4":
        case "day_5":
        case "total_1":
        case "total_2":
        case "total_3":
        case "total_4":
        case "total_5":
            return document.createTextNode(content.toLocaleString('en-US'));
        case "rank":
        case "ranking":
            return document.createTextNode("#" + content);
        default:
            return document.createTextNode(content);
    }
}

function sortingKey(column, content)
{
    if(content == null)
        return "000000000000000";
    return JSON.stringify(content).padStart(15);
}

function performSearch(gw, type, target, filter)
{
    try
    {
        const db = dbcache[gw];
        type = parseInt(type);
        let mode = type * 10 + parseInt(target);
        switch(mode)
        {
            case 10: content = db.exec("SELECT * FROM crews WHERE lower(name) LIKE '%"+filter+"%'"); break;
            case 11: content = db.exec("SELECT * FROM crews WHERE lower(name) LIKE '"+filter+"'"); break;
            case 12: content = db.exec("SELECT * FROM crews WHERE id = "+filter+""); break;
            case 13: content = db.exec("SELECT * FROM crews WHERE ranking = "+filter+""); break;
            case 0: content = db.exec("SELECT * FROM players WHERE lower(name) LIKE '%"+filter+"%'"); break;
            case 1: content = db.exec("SELECT * FROM players WHERE lower(name) LIKE '"+filter+"'"); break;
            case 2: content = db.exec("SELECT * FROM players WHERE user_id = "+filter+""); break;
            case 3: content = db.exec("SELECT * FROM players WHERE rank = "+filter+""); break;
            default: return;
        };
        resetOutput();
        let table_header = document.getElementById('table-header').children[0];
        let columns = [];
        for(let column of content[0].columns)
        {
            let th = document.createElement('th');
            th.id = cellType(column);
            th.appendChild(document.createTextNode(formatHeader(column)));
            columns.push(column);
            table_header.appendChild(th);
        }
        let table_content = document.getElementById('table-content');
        for(let value of content[0].values)
        {
            let tr = document.createElement('tr');
            for(let i = 0; i < value.length; i++) 
            {
                let td = document.createElement('td');
                td.id = cellType(columns[i]);
                td.appendChild(formatCell(columns[i], value[i], type)); 
                td.setAttribute('sorttable_customkey', sortingKey(columns[i], value[i]));
                tr.appendChild(td);
            }
            table_content.appendChild(tr);
        }
        sorttable.init();
        enable();
    }
    catch(error)
    {
        enable();
        document.getElementsByClassName("loading")[0].appendChild(document.createTextNode("An unexpected error occured."));
    }
}