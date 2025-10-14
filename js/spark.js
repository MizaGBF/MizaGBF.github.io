var calc_enabled = true;
const month_min = [90, 90, 140, 100, 80, 80, 110, 190, 100, 90, 90, 130];
const month_max = [80, 70, 110, 80, 60, 70, 70, 150, 80, 50, 70, 110];
const month_day = [31.0, 28.25, 31.0, 30.0, 31.0, 30.0, 31.0, 31.0, 30.0, 31.0, 30.0, 31.0];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var ts = null;

function load()
{
    var params = new URLSearchParams(window.location.search);
    var calc = params.get("calc");
    if(calc != null)
    {
        let elem = calc.split('x');
        document.getElementById("s1").value = elem[0];
        document.getElementById("s2").value = elem[1];
        document.getElementById("s3").value = elem[2];
        document.getElementById("s4").value = elem[3];
        ts = parseInt(elem[4]);
        calculator();
    }
}

function calc_enable()
{
    document.getElementById("s1").disabled = false;
    document.getElementById("s2").disabled = false;
    document.getElementById("s3").disabled = false;
    document.getElementById("s4").disabled = false;
    document.getElementById("sconfirm").disabled = false;
    calc_enabled = true;
}

function calc_disable()
{
    calc_enabled = false;
    document.getElementById("s1").disabled = true;
    document.getElementById("s2").disabled = true;
    document.getElementById("s3").disabled = true;
    document.getElementById("s4").disabled = true;
    document.getElementById("sconfirm").disabled = true;
    let res_area = document.getElementById("calc-result");
    while(res_area.childNodes.length > 0)
        res_area.removeChild(res_area.childNodes[0]);
}

function getIntegerInput(elemID)
{
    let value = document.getElementById(elemID).value;
    if(value === "") return 0;
    else if(isNaN(value)) return null;
    return Math.max(parseInt(value), 0);
}

function calculator()
{
    if(!calc_enabled) return;
    calc_disable();
    let inputs = [];
    for(let id of ["s1", "s2", "s3", "s4"])
    {
        let tmp = getIntegerInput(id)
        if(tmp == null)
        {
            document.getElementById("calc-result").appendChild(document.createTextNode("One of the value isn't a valid number."));
            calc_enable();
            return;
        }
        inputs.push(tmp);
    }
    let e = document.getElementById("calc-result");
    let now = (ts == null) ? new Date() : new Date(ts);
    ts = null;
    let roll = inputs[0] / 300 + inputs[1] + inputs[2] * 10 + inputs[3];
    e.appendChild(document.createTextNode(now.toISOString().split("T")[0] + ": You have " + roll.toFixed(1) + " Rolls"));
    e.appendChild(document.createElement("br"));

    let t_min = new Date(now.valueOf());
    let t_max = new Date(now.valueOf());
    let r_min = roll % 300;
    let r_max = r_min;
    let expected = [month_max[now.getMonth()], month_min[now.getMonth()]];
    while(r_min < 300 || r_max < 300)
    {
        let m;
        if(r_min < 300)
        {
            m = t_min.getMonth();
            r_min += month_min[m] / month_day[m];
            t_min.setDate(t_min.getDate() + 1);
        }
        if(r_max < 300)
        {
            m = t_max.getMonth();
            r_max += month_max[m] / month_day[m];
            t_max.setDate(t_max.getDate() + 1);
        }
    }
    e.appendChild(document.createTextNode("Next spark between " + t_min.toISOString().split("T")[0] + " and " + t_max.toISOString().split("T")[0] + "."));
    e.appendChild(document.createElement("br"));
    e.appendChild(document.createTextNode("Expecting between " + expected[0] + " and " + expected[1] + " rolls in " + monthNames[now.getMonth()] + "."));

    inputs.push(now.getTime());
    var params = new URLSearchParams(window.location.search);
    params.set("calc", inputs.join('x'));
    var newRelativePathQuery = window.location.pathname + '?' + params.toString();
    history.pushState(null, '', newRelativePathQuery);
    calc_enable();
}