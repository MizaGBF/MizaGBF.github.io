var obj = {
    mjolnir : false,
    hardcap : false,
    attack : 80000,
    modifier : 0
};

const DEF = 5;
const SOFT = [
    [0, 300000, 1],
    [300000, 100000, 0.9],
    [400000, 100000, 0.7],
    [500000, 100000, 0.5],
    [600000, null, 0.01]
];

function toggledCheck(name)
{
    switch(name)
    {
        case 'mjolnir': obj.mjolnir = document.getElementById(name).checked; break;
        case 'hardcap': obj.hardcap = document.getElementById(name).checked; break;
        default: return;
    }
    update();
}

function attackChanged()
{
    let val = document.getElementById('attack').value;
    if(!isNaN(val))
    {
        obj.attack = val;
        update();
    }
}

function modiferChanged()
{
    let val = document.getElementById('modifiers').value / 100;
    val = val == 0 ? 0 : Math.pow(10, val);
    obj.modifier = val;
    document.getElementById('mod_text').innerHTML = Math.round(obj.modifier) + "%";
    update();
}

function update()
{
    let raw = Math.round(obj.attack * (1 + obj.modifier / 100) * 2 / DEF);
    if(obj.mjolnir) raw *= 8;
    document.getElementById('raw').innerHTML = raw;
    let full = 0;
    for(let i = 0; i < SOFT.length; ++i)
    {
        if(raw > 0)
        {
            if(SOFT[i][1] == null)
            {
                full += raw * SOFT[i][2];
                break;
            }
            else
            {
                full += Math.min(SOFT[i][1], raw) * SOFT[i][2];
                document.getElementById('s'+(i+1)).value = 100 * Math.min(SOFT[i][1], raw) / SOFT[i][1];
            }
            raw -= SOFT[i][1];
        }
        else if(SOFT[i][1] != null)
        {
            document.getElementById('s'+(i+1)).value = 0;
        }
    }
    if(obj.hardcap && full > 6600000) full = 6600000;
    else if(!obj.hardcap && full > 13100000) full = 13100000;
    document.getElementById('final').innerHTML = Math.round(full);
}