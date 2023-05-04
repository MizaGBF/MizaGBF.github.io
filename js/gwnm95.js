const fights = [
    ["Ewiyar (Advent)", 180000000, "103471/3", "2040357000"],
    ["Wilnas (Advent)", 165000000, "103441/3", "2040354000"],
    ["Wamdus (Advent)", 182000000, "103451/3", "2040355000"],
    ["Galleon (Advent)", 196000000, "103461/3", "2040356000"],
    ["Gilbert (Proud)", 180000000, "103571/3", "conquest_001_proud"],
    ["Lu Woh (Advent)", 192000000, "103481/3", "2040358000"]
];
const nm95_hp = 131250000;

function load()
{
    const result = document.getElementById("percent_result");
    for(let fight of fights)
    {
        let a = document.createElement("a");
        a.setAttribute('href', "http://game.granbluefantasy.jp/#quest/supporter/" + fight[2]);
        result.appendChild(a);
        let div = document.createElement("div");
        a.appendChild(div);
        let img = document.createElement("img");
        img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/quest/assets/free/" + fight[3] + ".png"
        div.appendChild(img);
        div.appendChild(document.createElement("div"));
    }
    update();
}

function update()
{
    const result = document.getElementById("percent_result");
    let percent = document.getElementById("percent_range").value;
    document.getElementById("percent_value").innerText = percent + "% of NM95";
    let hp = parseInt(percent) * nm95_hp / 100;
    for(let i = 0; i < fights.length; ++i)
    {
        let remaining = Math.floor(1000 * (fights[i][1] - hp) / fights[i][1]) / 10;
        result.children[i].lastChild.lastChild.innerText = fights[i][0] + " - " + remaining + "% remaining";
    }
}