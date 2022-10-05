var anim_delay = 0;
var anim_count = 0;
var anim_mod = 10;
var running = false;
var sim = {};
var total_ssr = 0;
var total_roll = 0;
var total_rateup = null;

function generate()
{
    if(running) return;
    running = true;
    anim_count = 0;
    document.getElementById("sim-start").disabled = true;
    sim = {};
    let res = document.getElementById("sim-result");
    while(res.childNodes.length > 0)
        res.removeChild(res.lastChild);
    sim['count'] = parseInt(document.getElementById("roll-count").value);
    sim['legfest'] = document.getElementById("legfest").checked;
    sim['rateup'] = document.getElementById("rateup").checked;
    sim['rateup-value'] = document.getElementById("rateup-value").value;
    sim['ssr'] = 0;
    sim['ssrr'] = 0;
    if(sim['rateup'])
    {
        sim['rateup-value'] = parseFloat(sim['rateup-value']);
        if(isNaN(sim['rateup-value']))
        {
            res.appendChild(document.createTextNode("Invalid Rate up, it will be ignored"));
            res.appendChild(document.createElement("br"));
            sim['rateup'] = false;
        }
        else if(sim['rateup-value'] >= (sim['legfest'] ? 6 : 3) || sim['rateup-value'] < 0)
        {
            res.appendChild(document.createTextNode("Invalid Rate up, it will be ignored"));
            res.appendChild(document.createElement("br"));
            sim['rateup'] = false;
        }
    }
    sim['possibles'] = {
        "SSRr": (sim['rateup'] ? sim['rateup-value']  : 0),
        "SSR": (sim['legfest'] ? 6 : 3),
        "SR": 15,
        "R": null
    }
    sim['possibles']['SSR'] -= sim['possibles']['SSRr'];
    sim['result'] = []
    let sr_flag = false;
    for(let i = 0; i < sim['count']; ++i)
    {
        let step = i % 10;
        if(step == 0) sr_flag = false;
        let dice = Math.random() * 100;
        for(const [rarity, value] of Object.entries(sim['possibles']))
        {
            if(!sim['rateup'] && rarity === "SSRr") continue;
            if((sr_flag || step != 9 || (step == 9 && !sr_flag && rarity != "SR")) && rarity != 'R' && dice > value)
            {
                dice -= value;
            }
            else
            {
                sim['result'].push(rarity);
                if(rarity === 'SSRr' || rarity === 'SSR') sim['ssr']++;
                if(rarity === 'SSRr') sim['ssrr']++;
                if(rarity != 'R') sr_flag = true;
                break;
            }
        }
    }
    if(sim['count'] == 1)
    {
        anim_mod = 10;
        setTimeout(display, 500);
    }
    else if(sim['count'] < 100)
    {
        anim_mod = 10;
        anim_delay = 100;
        display();
    }
    else if(sim['count'] < 200)
    {
        anim_mod = 20;
        anim_delay = 50;
        display();
    }
    else
    {
        anim_mod = 20;
        anim_delay = 20;
        display();
    }
    console.log(sim);
}

function display()
{
    let res = document.getElementById("sim-result");
    let roll = sim['result'][0];
    sim['result'] = sim['result'].slice(1);
    let img = document.createElement('img');
    img.src = (roll == "SSRr") ? 'assets/ssr.png' : 'assets/' + roll.toLowerCase() + '.png';
    if(roll == "SSRr")
    {
        img.id = "img-rateup";
        img.title = "Rate up";
    }
    res.appendChild(img);
    anim_count++;
    if(anim_count % anim_mod == 0) res.appendChild(document.createElement('br'));
    if(sim['result'].length > 0)
        setTimeout(display, anim_delay);
    else
    {
        if(anim_count % anim_mod != 0) res.appendChild(document.createElement('br'));
        res.appendChild(document.createTextNode((Math.round(1000 * sim['ssr'] / sim['count']) / 10) + "% SSR Rate" + (sim['rateup'] ? ", including " + sim['ssrr'] + " rateup(s)" : "")));
        total_ssr += sim['ssr'];
        total_roll += sim['count'];
        if(sim['rateup']) total_rateup = (total_rateup === null) ? sim['ssrr'] : total_rateup + sim['ssrr'];
        update_cost();
        running = false;
        document.getElementById("sim-start").disabled = false;
    }
}

function update_cost()
{
    let resultArea = document.getElementById("sim-cost");
    while(resultArea.childNodes.length > 0)
        resultArea.removeChild(resultArea.lastChild);
    resultArea.appendChild(document.createTextNode("Total: " + total_ssr + " SSR " + (total_rateup === null ? "" : "(" + total_rateup + " rateups)") + " in " + total_roll + " rolls\nCost: " + (total_roll * 300) + " crystals or mobacoins"));
}

function reset_cost()
{
    total_ssr = 0;
    total_roll = 0;
    total_rateup = null;
    update_cost();
}