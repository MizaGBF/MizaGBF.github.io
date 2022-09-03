var calc_enabled = true;
var speed_enabled = true;

function load()
{
    var params = new URLSearchParams(window.location.search);
    var calc = params.get("calc");
    if(calc != null)
    {
        let elem = calc.split('x');
        document.getElementById("gwut1").value = elem[0];
        document.getElementById("gwut2").value = elem[1];
        document.getElementById("gwut4").value = elem[2];
        document.getElementById("gwut5").value = elem[3];
        document.getElementById("gwut6").value = elem[4];
        calculator();
    }
    var spe = params.get("speed");
    if(spe != null)
    {
        let elem = spe.split('x');
        document.getElementById("gwut10").value = elem[0];
        document.getElementById("gwut11").value = elem[1];
        document.getElementById("gwut12").value = elem[2];
        document.getElementById("gwut13").value = elem[3];
        document.getElementById("gwut14").value = elem[4];
        document.getElementById("gwut15").value = elem[5];
        speed();
    }
}

function calc_enable()
{
    document.getElementById("gwut1").disabled = false;
    document.getElementById("gwut2").disabled = false;
    document.getElementById("gwut4").disabled = false;
    document.getElementById("gwut5").disabled = false;
    document.getElementById("gwut6").disabled = false;
    document.getElementById("gwut1confirm").disabled = false;
    calc_enabled = true;
}

function calc_disable()
{
    calc_enabled = false;
    document.getElementById("gwut1").disabled = true;
    document.getElementById("gwut2").disabled = true;
    document.getElementById("gwut4").disabled = true;
    document.getElementById("gwut5").disabled = true;
    document.getElementById("gwut6").disabled = true;
    document.getElementById("gwut1confirm").disabled = true;
    let res_area = document.getElementById("calc-result");
    while(res_area.childNodes.length > 0)
        res_area.removeChild(res_area.childNodes[0]);
}

function getIntegerInput(elemID)
{
    let value = document.getElementById(elemID).value;
    if(value === "") return 0;
    else if(isNaN(value))
    {
        let chara = value.slice(-1).toLowerCase();
        value = parseFloat(value.slice(0, -1));
        if(isNaN(value)) return null;
        switch(chara)
        {
            case 'k': return Math.round(value * 1000);
            case 'm': return Math.round(value * 1000000);
            case 'b': return Math.round(value * 1000000000);
            default: return null;
        }
    }
    return parseInt(value);
}

function separate(value)
{
    return value.toLocaleString('en-US');
}

function calculator()
{
    if(!calc_enabled) return;
    calc_disable();
    let inputs = [];
    for(let id of ["gwut1", "gwut2", "gwut4", "gwut5", "gwut6"])
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
    if(inputs[3] > 0)
    {
        let base = [
            ['★', 20, 52, 320], // name, AP, tokens, honors
            ['★★', 30, 70, 788],
            ['★★★', 40, 97, 3730],
            ['★★★★', 50, 146, 20330],
            ['★★★★★', 50, 243, 41000]
        ];
        switch(inputs[2])
        {
            case 0:
            {
                let token = Math.max(inputs[3] - Math.max(inputs[0], 0), 0);
                let box = Math.max(inputs[1], 1) - 1;
                if(box == 0 && token >= 1600)
                {
                    token -= 1600;
                    box += 1;
                }
                while(box < 4 && token >= 2404)
                {
                    token -= 2404;
                    box += 1;
                }
                while(box < 20 & token >= 2000)
                {
                    token -= 2000;
                    box += 1;
                }
                while(box < 40 & token >= 10000)
                {
                    token -= 10000;
                    box += 1;
                }
                while(token >= 15000)
                {
                    token -= 15000;
                    box += 1;
                }
                let e = document.getElementById("calc-result");
                e.appendChild(document.createTextNode(separate(inputs[3]) + " more Tokens will give you " + separate(box - Math.max(inputs[1], 1) + 1) + " more box(s) (Total: " + separate(box) + "), with " + separate(token) + " leftover tokens."));
                e.appendChild(document.createElement("br"));
                e.appendChild(document.createElement("br"));
                for(let bv of base)
                {
                    let v = Math.ceil(inputs[3] / (bv[2]));
                    let li = document.createElement("li");
                    e.appendChild(li);
                    li.appendChild(document.createTextNode(separate(v) + " " + bv[0] + " (Need " + separate(v*bv[1]) + " AP) for " + separate(v*bv[3]) + " Honors."));
                }
                e.appendChild(document.createElement("br"));
                if(inputs[0] > 0)
                    e.appendChild(document.createTextNode("Owned tokens have been deducted."));
                break
            }
            case 1:
            {
                let target_box = Math.max(inputs[3], 0);
                let token = 0;
                let box = Math.max(inputs[1], 1);
                for(; box <= target_box; box++)
                {
                    if(box == 1) token+= 1600;
                    else if(box <= 4) token += 2400;
                    else if(box <= 45) token += 2000;
                    else if(box <= 80) token += 10000;
                    else token += 15000;
                }
                token -= Math.max(inputs[0], 0);
                let e = document.getElementById("calc-result");
                if(token <= 0)
                {
                    e.appendChild(document.createTextNode("You have enough Tokens to reach Box " + separate(target_box) + "."));
                }
                else
                {
                    let e = document.getElementById("calc-result");
                    e.appendChild(document.createTextNode("To reach Box " + separate(inputs[3]) + ", you need " + separate(token) + " more Tokens."));
                    e.appendChild(document.createElement("br"));
                    for(let bv of base)
                    {
                        let v = Math.ceil(token / (bv[2]));
                        let li = document.createElement("li");
                        e.appendChild(li);
                        li.appendChild(document.createTextNode(separate(v) + " " + bv[0] + " (Need " + separate(v*bv[1]) + " AP)."));
                    }
                }
                break;
            }
            case 3:
            {
                let honor = Math.max(inputs[3], 0);
                let e = document.getElementById("calc-result");
                if(inputs[3] < base[0][3])
                    e.appendChild(document.createTextNode("Any fight will give you at least " + separate(inputs[3]) + " Honors."));
                else
                    e.appendChild(document.createTextNode("To reach " + separate(inputs[3]) + " Honors, you can host the following:"));
                for(let bv of base)
                {
                    let n = Math.floor(inputs[3] / bv[3]);
                    if(n > 0)
                    {
                        let li = document.createElement("li");
                        e.appendChild(li);
                        li.appendChild(document.createTextNode(separate(n) + " " + bv[0] + " (Need " + separate(n*bv[1]) + " AP)."));
                    }
                }
                break;
            }
            default:
                break
        }
        var params = new URLSearchParams(window.location.search);
        params.set("calc", inputs.join('x'));
        var newRelativePathQuery = window.location.pathname + '?' + params.toString();
        history.pushState(null, '', newRelativePathQuery);
    }
    calc_enable();
}


function speed_enable()
{
    document.getElementById("gwut10").disabled = false;
    document.getElementById("gwut11").disabled = false;
    document.getElementById("gwut12").disabled = false;
    document.getElementById("gwut13").disabled = false;
    document.getElementById("gwut14").disabled = false;
    document.getElementById("gwut15").disabled = false;
    document.getElementById("gwut2confirm").disabled = false;
    speed_enabled = true;
}

function speed_disable()
{
    speed_enabled = false;
    document.getElementById("gwut10").disabled = true;
    document.getElementById("gwut11").disabled = true;
    document.getElementById("gwut12").disabled = true;
    document.getElementById("gwut13").disabled = true;
    document.getElementById("gwut14").disabled = true;
    document.getElementById("gwut15").disabled = true;
    document.getElementById("gwut2confirm").disabled = true;
    let res_area = document.getElementById("speed-result");
    while(res_area.childNodes.length > 0)
        res_area.removeChild(res_area.childNodes[0]);
}

function retrieveSecond(elemID)
{
    let value = document.getElementById(elemID).value;
    if(value === "") return null;
    let el = value.split(":");
    if(el.length > 2) return null;
    let second = 0;
    for(let e of el)
    {
        let s = parseInt(e);
        if(isNaN(s)) return null;
        second = second * 60 + Math.max(s, 0);
    }
    return second;
}

function reduceNumber(num)
{
    let count = 0;
    while(num >= 1000)
    {
        num /= 1000;
        count += 1;
        if(count >= 3) break;
    }
    num = num.toFixed(1);
    switch(count)
    {
        case 1: return num + "K";
        case 2: return num + "M";
        case 3: return num + "B";
        default: return num;
    }
}

function speed()
{
    if(!speed_enabled) return;
    speed_disable();
    let inputs = [];
    for(let id of ["gwut10", "gwut11", "gwut12", "gwut13", "gwut14", "gwut15"])
    {
        inputs.push(retrieveSecond(id));
    }
    if(inputs[0] == null) inputs[0] = 0;
    else inputs[0] = Math.max(inputs[0], 0);
    let fightdata = [
        ['★', -20, 52, 320], // name, AP, tokens, honors
        ['★★', -30, 70, 788],
        ['★★★', -40, 97, 3730],
        ['★★★★', -50, 146, 20330],
        ['★★★★★', -50, 243, 41000]
    ];
    let e = document.getElementById("speed-result");
    e.appendChild(document.createTextNode("Results for one hour of farming:"));
    e.appendChild(document.createElement("br"));
    for(let i = 1; i < inputs.length; ++i)
    {
        if(inputs[i] == null) continue;
        let mod = (3600 / (inputs[i] + inputs[0]));
        let li = document.createElement("li");
        e.appendChild(li);
        if(mod < 1)
        {
            li.appendChild(document.createTextNode(fightdata[i-1][0] + ": Clear time is too high"));
        }
        else
        {
            li.appendChild(document.createTextNode(fightdata[i-1][0] + ": " + reduceNumber(fightdata[i-1][3] * mod) + ", " + reduceNumber(fightdata[i-1][1] * mod) + " AP, " + reduceNumber(fightdata[i-1][2] * mod) + " Tokens"));
        }
    }
    var params = new URLSearchParams(window.location.search);
    params.set("speed", inputs.join('x'));
    var newRelativePathQuery = window.location.pathname + '?' + params.toString();
    history.pushState(null, '', newRelativePathQuery);
    speed_enable();
}