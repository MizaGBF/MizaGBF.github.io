function JSTclock()
{
    let date = new Date(new Date().getTime() + 9 * 3600000).toISOString();
    const div = document.getElementById("clock");
    div.innerText = date.split('T')[0] + " " + date.split('T')[1].split('.')[0];
    setTimeout(JSTclock, new Date().getTime() % 1000 + 1);
}

setInterval(JSTclock, 500);